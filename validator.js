const settings = require('./settings.json')
const moment = require('moment');

class Validator {
  constructor(params) {
    if (params && params.start) this.startDate = moment(params.start)
    if (params && params.end) this.endDate = moment(params.end)
    this.errors = {}
  }

  hasErrors() {
    return Object.keys(this.errors).length !== 0
  }

  errorsPromise() {
    return Promise.reject(this.errors)
  }

  validate() {
    this.errors = {}
    this.validateDates()
    return !this.hasErrors()
  }

  validateDates() {
    const dateErrors = {
      start: [],
      end: []
    }
    const minimumDate = moment().subtract(settings.validations.maxYearsPast, 'years')
    let parsableStart = true;
    let parsableEnd = true;

    if (!this.startDate || !this.startDate.isValid()) {
      parsableStart = false
      dateErrors.start.push('Graph data must include properly formatted start date.')
    }
    if (!this.endDate || !this.endDate.isValid()) {
      parsableEnd = false
      dateErrors.end.push('Graph data must include properly formatted end date.')
    }
    if (parsableStart) {
      if (this.startDate < minimumDate) {
        dateErrors.start.push(`Graph data must begin with start date on or after ${minimumDate.format('MM-DD-YYYY')}.`)
      }
    }
    if (parsableEnd) {
      const endOfDay = moment().utcOffset(this.endDate.utcOffset()).endOf('day')
      if (this.endDate > endOfDay) {
        dateErrors.end.push(`Graph data must conclude with end date on before ${endOfDay.format('MM-DD-YYYY')}.`)
      }
    }
    if (parsableStart && parsableEnd) {
      if (moment.duration(this.endDate.diff(this.startDate)).asYears() > settings.validations.maxDuration) {
        dateErrors.start.push(`Graph data must only span a maximum of ${settings.validations.maxDuration} years.`)
        dateErrors.end.push(`Graph data must only span a maximum of ${settings.validations.maxDuration} years.`)
      }
      if (this.startDate > this.endDate) {
        dateErrors.start.push(`Graph data must begin with start date that comes before the end date.`)
      }
    }

    if (dateErrors.start.length > 0) this.errors.start = dateErrors.start
    if (dateErrors.end.length > 0) this.errors.end = dateErrors.end
  }
}

module.exports = Validator

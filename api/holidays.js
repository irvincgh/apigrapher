'use strict'

const moment = require('moment')
const requestPromise = require('request-promise')
const Validator = require('../validator.js')
const settings = require('../settings.json')

const filterDates = function filterDates(holidays, start, end) {
  return holidays.filter((holiday) => {
    const holiDate = moment(holiday.date)
    return holiDate >= start && holiDate <= end
  })
}

const get = function get(params) {
  const validator = new Validator(params)
  if (!validator.validate()) return validator.errorsPromise()

  const start = moment(params['start'])
  const end = moment(params['end'])
  const startYear = start.format('YYYY')
  const endYear = end.format('YYYY')
  const promises = []

  for (let year = startYear; year <= endYear; year++) {
    const options = {
      method: 'GET',
      url: `${settings.external.holidays.urlRoot}/${settings.external.holidays.urlPath}/${year}`
    }
    promises.push(requestPromise(options))
  }

  return Promise.all(promises).then((results) => {
    return results.map((result) => {return filterDates(JSON.parse(result), start, end)}).flat()
  })
}

module.exports = get
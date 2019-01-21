'use strict'

const Validator = require('../validator.js')
const moment = require('moment')
const RANDOM_COUNT = 100
const RANDOM_MAX = 100

const get = function get(params) {
  const validator = new Validator(params)
  if (!validator.validate()) return validator.errorsPromise()

  return new Promise((resolve) => {
    const result = []
    const startDate = moment(params['start'])
    const endDate = moment(params['end'])
    const daysDiff = moment.duration(endDate.diff(startDate)).asDays()

    for (let x = 0; x < RANDOM_COUNT; x++) {
      const randomDays = Math.floor(Math.random() * (daysDiff + 1))
      const randomDate = moment(startDate).add(randomDays, 'days')
      result.push({
        date: randomDate.format('YYYY-MM-DD'),
        value: Math.floor(Math.random() * (RANDOM_MAX + 1))
      })
    }

    resolve(result)
  })
}

module.exports = get

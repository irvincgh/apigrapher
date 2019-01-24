'use strict'

const requestPromise = require('request-promise')
const moment = require('moment')
const Validator = require('../validator.js')
const settings = require('../settings.json')

const DEFAULT_LIMIT = 100

const makeRequest = function makeRequest(crimes, start, end, page) {
  const options = {
    method: 'GET',
    url: `${settings.external.bikeCrimes.urlRoot}/${settings.external.bikeCrimes.urlPath}`,
    qs: {
      occurred_after: start,
      occurred_before: end,
      proximity: 'Manhattan, NY',
      proximity_square: 50,
      per_page: DEFAULT_LIMIT,
      page: page,
      incident_type: 'theft'
    }
  }

  return requestPromise(options).then((response) => {
    const results = JSON.parse(response)
    crimes = crimes.concat(results.incidents)

    if (results.incidents.length > 0) {
      return makeRequest(crimes, start, end, page + 1)
    } else {
      return crimes.flat()
    }
  })
}

const get = function get(params) {
  const validator = new Validator(params)
  if (!validator.validate()) return validator.errorsPromise()

  const unixStart = moment(params['start']).unix()
  const unixEnd = moment(params['end']).unix()

  return makeRequest([], unixStart, unixEnd, 1)
}

module.exports = get

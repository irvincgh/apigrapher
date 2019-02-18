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

    for (const incident of results.incidents) {
      const date = moment(incident.occurred_at * 1000).format(settings.config.dateFormat)
      crimes[date] = crimes[date] === undefined ? 1 : crimes[date] + 1
    }

    if (results.incidents.length > 0) {
      return makeRequest(crimes, start, end, page + 1)
    } else {
      const crimesArray = []
      for (const date in crimes) {
        crimesArray.push({
          date: date,
          value: crimes[date]
        })
      }
      return crimesArray
    }
  })
}

const get = function get(params) {
  const validator = new Validator(params)
  if (!validator.validate()) return validator.errorsPromise()

  const unixStart = moment(params['start']).unix()
  const unixEnd = moment(params['end']).unix()

  return makeRequest({}, unixStart, unixEnd, 1)
}

module.exports = get

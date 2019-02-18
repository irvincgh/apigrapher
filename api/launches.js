'use strict'

const requestPromise = require('request-promise')
const Validator = require('../validator.js')
const settings = require('../settings.json')
const moment = require('moment')
const DEFAULT_LIMIT = 100

const makeRequest = function makeRequest(launches, start, end, offset) {
  const options = {
    method: 'GET',
    url: `${settings.external.launches.urlRoot}/${settings.external.launches.urlPath}`,
    qs: {
      startdate: start,
      enddate: end,
      limit: DEFAULT_LIMIT,
      offset: offset
    }
  }

  return requestPromise(options).then((response) => {
    const results = JSON.parse(response)
    launches = launches.concat(results.launches)
    if (results.total > launches.length) {
      return makeRequest(launches, start, end, offset + DEFAULT_LIMIT)
    } else {
      return launches.flat().map((launch) => {
        return {
          date: moment(launch.net.replace('UTC', '+0000'), 'MMMM D, YYYY HH:mm:ss Z').format(settings.config.dateFormat),
          value: launch.name
        }
      })
    }
  })
}

const get = function get(params) {
  const validator = new Validator(params)
  if (!validator.validate()) return validator.errorsPromise()
  return makeRequest([], params['start'], params['end'], 0)
}

module.exports = get

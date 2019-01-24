'use strict'

const requestPromise = require('request-promise')
const Validator = require('../validator.js')
const settings = require('../settings.json')

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
      return launches.flat()
    }
  })
}

const get = function get(params) {
  const validator = new Validator(params)
  if (!validator.validate()) return validator.errorsPromise()

  return makeRequest([], params['start'], params['end'], 0)
}

module.exports = get

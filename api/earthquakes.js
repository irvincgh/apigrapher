'use strict'

const requestPromise = require('request-promise')
const Validator = require('../validator.js')
const settings = require('../settings.json')
const moment = require('moment')
const DEFAULT_LOCATION = 'losangeles'

const get = function get(params) {
  const validator = new Validator(params)
  if (!validator.validate()) return validator.errorsPromise()

  const location = settings.locations[DEFAULT_LOCATION]
  const options = {
    method: 'GET',
    url: `${settings.external.earthquakes.urlRoot}/${settings.external.earthquakes.urlPath}`,
    qs: {
      latitude: location.latitude,
      longitude: location.longitude,
      format: 'geojson',
      starttime: params['start'],
      endtime: params['end'],
      maxradiuskm: 80.4672
    }
  }

  return requestPromise(options).then((results) => {
    return JSON.parse(results).features.map((earthquake) => {
      return {
        date: moment(earthquake.properties.time).format(settings.config.dateFormat),
        value: earthquake.properties.mag
      }
    })
  })
}

module.exports = get

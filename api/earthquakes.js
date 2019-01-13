'use strict';

const requestPromise = require('request-promise');
const Validator = require('../validator.js')
const settings = require('../settings.json')

const get = function get(params) {
  const validator = new Validator(params)
  if (!validator.validate()) return validator.errorsPromise()

  const options = {
    method: 'GET',
    url: 'https://earthquake.usgs.gov/fdsnws/event/1/query',
    qs: {
      format: 'geojson',
      starttime: params['start'],
      endtime: params['end'],
      maxradiuskm: 80.4672
    }
  };
  const location = settings.locations[params['location']];

  if (location) {
    options.qs.latitude = location.latitude;
    options.qs.longitude = location.longitude;
  } else {
    return Promise.reject({ location: "Invalid earthquake data location." });
  }

  return requestPromise(options).then((results) => {
    return JSON.parse(results);
  });
};

module.exports = get;

'use strict';

const requestPromise = require('request-promise')
const Validator = require('../validator.js')

const get = function get(params, gotIt) {
  const validator = new Validator(params)
  if (!validator.validate()) return validator.errorsPromise()

  const startYear = parseInt(params['start'].split('-')[0])
  const endYear = parseInt(params['end'].split('-')[0])
  const promises = []

  for (var year = startYear; year <= endYear; year++) {
    const options = {
      method: 'GET',
      url: `https://date.nager.at/api/v1/get/US/${year}`
    };
    promises.push(requestPromise(options))
  }

  return Promise.all(promises).then((results) => {
    return results.map((result) => {return JSON.parse(result)}).flat()
  })
};

module.exports = get;
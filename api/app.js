'use strict'

const express = require('express')
const getBikeCrimes = require('./bikecrimes.js')
const getEarthquakes = require('./earthquakes.js')
const getHolidays = require('./holidays.js')
const getRandom = require('./randomness.js')
const getLaunches = require('./launches.js')
const app = express()

app.use('/', express.static('public'))

app.get('/api/bikecrimes', (req, res, next) => {
  getBikeCrimes(req.query).then((data) => {
    res.json(data)
  }).catch((error) => {
    res.status(400).json(buildErrorResponse(error))
  }).finally(() => {
    next()
  })
})
app.get('/api/holidays', (req, res, next) => {
  getHolidays(req.query).then((data) => {
    res.json(data)
  }).catch((error) => {
    res.status(400).json(buildErrorResponse(error))
  }).finally(() => {
    next()
  })
})
app.get('/api/earthquakes', (req, res, next) => {
  getEarthquakes(req.query).then((data) => {
    res.json(data)
  }).catch((error) => {
    res.status(400).json(buildErrorResponse(error))
  }).finally(() => {
    next()
  })
})
app.get('/api/randomness', (req, res, next) => {
  getRandom(req.query).then((data) => {
    res.json(data)
  }).catch((error) => {
    res.status(400).json(buildErrorResponse(error))
  }).finally(() => {
    next()
  })
})
app.get('/api/launches', (req, res, next) => {
  getLaunches(req.query).then((data) => {
    res.json(data)
  }).catch((error) => {
    res.status(400).json(buildErrorResponse(error))
  }).finally(() => {
    next()
  })
})

const buildErrorResponse = function (error) {
  let errorResponse = error instanceof Error ? { 'serverError': error.message } : error
  return {'errors': errorResponse}
}
module.exports = app
'use strict'

const express = require('express')
const getEarthquakes = require('./earthquakes.js')
const getHolidays = require('./holidays.js')
const app = express()

app.use('/', express.static('public'))
app.get('/api/holidays', (req, res, next) => {
  getHolidays(req.query).then((data) => {
    res.send(data)
  }).catch((error) => {
    res.status(400).send({'errors': error})
  }).finally(() => {
    next()
  })
})
app.get('/api/earthquakes', (req, res, next) => {
  getEarthquakes(req.query).then((data) => {
    res.json(data)
  }).catch((error) => {
    res.status(400).json({'errors': error})
  }).finally(() => {
    next()
  })
})

module.exports = app
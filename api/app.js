'use strict'

const express = require('express')
const getEarthquakes = require('./earthquakes.js')
const getHolidays = require('./holidays.js')
const app = express()
const port = 3001

app.use('/', express.static('public'))
app.get('/api/holiday', (req, res, next) => {
  getHolidays(req.query).then((data) => {
    res.send(JSON.stringify(data))
  }).catch((error) => {
    res.status(400).send(JSON.stringify(error))
  }).finally(() => {
    next()
  })
})
app.get('/api/earthquake', (req, res, next) => {
  getEarthquakes(req.query).then((data) => {
    res.send(JSON.stringify(data))
  }).catch((error) => {
    res.status(400).send(JSON.stringify(error))
  }).finally(() => {
    next()
  })
})
app.listen(port, () => console.log(`Listening on port ${port}!`))
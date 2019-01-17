const supertest = require('supertest')
const app = require('../../api/app.js')
const settings = require('../../settings.json')
const mockEarthquakes = require('../mocks/earthquakes.json')
const request = supertest(app)
const nock = require('nock')
const moment = require('moment')
const expect = require('chai').expect

describe('Earthquakes API', function() {
  describe('GET /api/earthquakes', function() {
    let resultBody
    let resultStatus
    let path

    beforeEach(function() {
      resultBody = null
      resultStatus = null
      return request
        .get(path)
        .then(function(response) {
          resultBody = response.body
          resultStatus = response.status
        })
    })

    context('empty params', function() {
      before(function() {
        path = '/api/earthquakes'
      })

      it('returns with errors', function() {
        expect(resultBody.errors.start.length).to.equal(1)
        expect(resultBody.errors.end.length).to.equal(1)
      })
      it('is a bad request', function() {
        expect(resultStatus).to.equal(400)
      })
    })

    context('valid params', function() {
      before(function() {
        nock(settings.external.earthquakes.urlRoot)
          .persist()
          .get(`/${settings.external.earthquakes.urlPath}`)
          .query(true)
          .reply(200, JSON.stringify(mockEarthquakes))
      })
      before(function() {
        const end = moment()
        const start = moment().subtract(7, 'days')
        path = `/api/earthquakes?start=${start.format('YYYY-MM-DD')}&end=${end.format('YYYY-MM-DD')}`
      })

      it('is a successful request', function() {
        expect(resultStatus).to.equal(200)
      })
      it('returns with expected number of earthquakes', function() {
        expect(resultBody.features.length).to.equal(1)
      })
      it('returns with earthquake in expected format', function() {
        expect(resultBody.features[0].properties.time).to.equal(mockEarthquakes.features[0].properties.time)
        expect(resultBody.features[0].properties.mag).to.equal(mockEarthquakes.features[0].properties.mag)
      })
    })
  })
})
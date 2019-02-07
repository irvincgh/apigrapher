const supertest = require('supertest')
const app = require('../../api/app.js')
const settings = require('../../settings.json')
const mockCrimes = require('../mocks/bikecrimes.json')
const request = supertest(app)
const nock = require('nock')
const moment = require('moment')
const expect = require('chai').expect

describe('Bike Crimes API', function() {
  describe('GET /api/bikecrimes', function() {
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
        path = '/api/bikecrimes'
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
        nock(settings.external.bikeCrimes.urlRoot)
          .persist()
          .get(`/${settings.external.bikeCrimes.urlPath}?occurred_after=1388563200&occurred_before=1433142000&proximity=Manhattan%2C%20NY&proximity_square=50&per_page=100&page=1&incident_type=theft`)
          .reply(200, JSON.stringify(mockCrimes['1']))
          .get(`/${settings.external.bikeCrimes.urlPath}?occurred_after=1388563200&occurred_before=1433142000&proximity=Manhattan%2C%20NY&proximity_square=50&per_page=100&page=2&incident_type=theft`)
          .reply(200, JSON.stringify(mockCrimes['2']))
          .get(`/${settings.external.bikeCrimes.urlPath}?occurred_after=1388563200&occurred_before=1433142000&proximity=Manhattan%2C%20NY&proximity_square=50&per_page=100&page=3&incident_type=theft`)
          .reply(200, JSON.stringify(mockCrimes['3']))
      })
      before(function() {
        path = `/api/bikecrimes?start=2014-01-01&end=2015-06-01`
      })

      it('is a successful request', function() {
        expect(resultStatus).to.equal(200)
      })
      it('returns with expected number of bike crimes', function() {
        expect(resultBody.length).to.equal(124)
      })
      it('returns with bike crimes in expected format', function() {
        for (let i = 0; i < 124; i++) {
          expect(resultBody[i].value).to.be.a('number')
          expect(resultBody[i].date).to.match(/\d{4}-\d{2}-\d{2}/)
        }
      })
    })
  })
})

const supertest = require('supertest')
const app = require('../../api/app.js')
const settings = require('../../settings.json')
const mockHolidays = require('../mocks/holidays.json')
const request = supertest(app)
const nock = require('nock')
const moment = require('moment')
const expect = require('chai').expect

describe('Holidays API', function() {
  describe('GET /api/holidays', function() {
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
        path = '/api/holidays'
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
        nock(settings.external.holidays.urlRoot)
          .persist()
          .get(`/${settings.external.holidays.urlPath}/2018`)
          .query(true)
          .reply(200, JSON.stringify(mockHolidays["2018"]))
      })
      before(function() {
        path = `/api/holidays?start=2018-01-01&end=2018-06-01`
      })

      it('is a successful request', function() {
        expect(resultStatus).to.equal(200)
      })
      it('returns with expected number of holidays', function() {
        expect(resultBody.length).to.equal(4)
      })
      it('returns with holidays in expected format', function() {
        expect(resultBody[0].date).to.equal(mockHolidays["2018"][0].date)
        expect(resultBody[0].name).to.equal(mockHolidays["2018"][0].name)
      })

      context('dates span multiple years', function() {
        before(function() {
          nock(settings.external.holidays.urlRoot)
            .persist()
            .get(`/${settings.external.holidays.urlPath}/2018`)
            .reply(200, JSON.stringify(mockHolidays["2018"]))
            .get(`/${settings.external.holidays.urlPath}/2019`)
            .reply(200, JSON.stringify(mockHolidays["2019"]))
        })

        before(function() {
          path = `/api/holidays?start=2018-01-01&end=2019-01-01`
        })

        it('is a successful request', function() {
          expect(resultStatus).to.equal(200)
        })
        it('returns with expected number of holidays', function() {
          console.log(resultBody)
          expect(resultBody.length).to.equal(11)
        })
        it('returns with holidays in expected format', function() {
          expect(resultBody[10].date).to.equal(mockHolidays["2019"][0].date)
          expect(resultBody[10].name).to.equal(mockHolidays["2019"][0].name)
        })
      })
    })
  })
})
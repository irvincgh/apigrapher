const supertest = require('supertest')
const app = require('../../api/app.js')
const settings = require('../../settings.json')
const mockLaunches = require('../mocks/launches.json')
const request = supertest(app)
const nock = require('nock')
const moment = require('moment')
const expect = require('chai').expect

describe('Launches API', function() {
  describe('GET /api/launches', function() {
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
        path = '/api/launches'
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
        nock(settings.external.launches.urlRoot)
          .persist()
          .get(`/${settings.external.launches.urlPath}?startdate=2017-01-01&enddate=2019-01-01&limit=100&offset=0`)
          .reply(200, JSON.stringify(mockLaunches['0']))
          .get(`/${settings.external.launches.urlPath}?startdate=2017-01-01&enddate=2019-01-01&limit=100&offset=100`)
          .reply(200, JSON.stringify(mockLaunches['100']))
          .get(`/${settings.external.launches.urlPath}?startdate=2017-01-01&enddate=2019-01-01&limit=100&offset=200`)
          .reply(200, JSON.stringify(mockLaunches['200']))
        path = `/api/launches?start=2017-01-01&end=2019-01-01`
      })

      it('is a successful request', function() {
        expect(resultStatus).to.equal(200)
      })
      it('returns with expected number of launches', function() {
        expect(resultBody.length).to.equal(205)
      })
      it('returns with launches in expected format', function() {
        for (let i = 0; i < 205; i++) {
          const key = Math.floor(i / 100) * 100
          const index = i - key
          expect(resultBody[i].date).to.equal(moment(mockLaunches[key.toString()].launches[index].net.replace('UTC', '+0000'), 'MMMM D, YYYY HH:mm:ss Z').format(settings.config.dateFormat))
          expect(resultBody[i].value).to.equal(mockLaunches[key.toString()].launches[index].name)
        }
      })

      context('no results', function() {
        before(function() {
          nock(settings.external.launches.urlRoot)
            .persist()
            .get(`/${settings.external.launches.urlPath}?startdate=2016-01-01&enddate=2016-01-31&limit=100&offset=0`)
            .reply(404, JSON.stringify(mockLaunches['none']))
          path = `/api/launches?start=2016-01-01&end=2016-01-31`
        })

        it('is a successful request', function() {
          expect(resultStatus).to.equal(200)
        })
        it('returns with expected number of launches', function() {
          expect(resultBody.length).to.equal(0)
        })
        it('returns with empty array', function() {
          expect(resultBody).to.eql([])
        })
      })
    })
  })
})

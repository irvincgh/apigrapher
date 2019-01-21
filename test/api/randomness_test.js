const supertest = require('supertest')
const app = require('../../api/app.js')
const settings = require('../../settings.json')
const request = supertest(app)
const moment = require('moment')
const expect = require('chai').expect

describe('Randomness API', function() {
  describe('GET /api/randomness', function() {
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
        path = '/api/randomness'
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
      let end
      let start
      before(function() {
        end = moment()
        start = moment().subtract(7, 'days')
        path = `/api/randomness?start=${start.format('YYYY-MM-DD')}&end=${end.format('YYYY-MM-DD')}`
      })

      it('is a successful request', function() {
        expect(resultStatus).to.equal(200)
      })
      it('returns with expected number of random values', function() {
        expect(resultBody.length).to.equal(100)
      })
      it('returns with random values in expected format', function() {
        for (const data of resultBody) {
          const date = moment(data.date)
          expect(data.value <= 100).to.equal(true)
          expect(data.value >= 0).to.equal(true)
          expect(date.format('YYYY-MM-DD') <= end.format('YYYY-MM-DD')).to.equal(true)
          expect(date.format('YYYY-MM-DD') >= start.format('YYYY-MM-DD')).to.equal(true)
        }
      })
    })
  })
})
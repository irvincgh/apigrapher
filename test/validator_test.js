const moment = require('moment')
const should = require('chai').should()
const settings = require('../settings.json')
const Validator = require('../validator.js')

describe('Validator', function() {
  let params
  let validator

  before(function() {
    validator = new Validator(params)
  })

  describe('#validate', function() {
    let validateResult

    beforeEach(function() {
      validateResult = validator.validate()
    })
    context('missing start date', function() {
      it('should be false', function() {
        validateResult.should.equal(false)
      })
      it('has expected error set', function() {
        validator.errors.start[0].should.match(/must include properly formatted start date/)
      })
    })
    context('missing end date', function() {
      it('should be false', function() {
        validateResult.should.equal(false)
      })
      it('has expected error set', function() {
        validator.errors.end[0].should.match(/must include properly formatted end date/)
      })
    })
    context('start date too far back', function() {
      before(function() {
        params = { 'start': '1800-01-01' }
        validator = new Validator(params)
      })
      it('should be false', function() {
        validateResult.should.equal(false)
      })
      it('has expected error set', function() {
        validator.errors.start[0].should.match(/must begin with start date on or after/)
      })
    })
    context('end date in future', function() {
      before(function() {
        const tomorrow = moment().add(1, 'day')
        params = { 'end': tomorrow.format('YYYY-MM-DD') }
        validator = new Validator(params)
      })
      it('should be false', function() {
        validateResult.should.equal(false)
      })
      it('has expected error set', function() {
        validator.errors.end[0].should.match(/must conclude with end date on before/)
      })
    })
    context('start date comes after end date', function() {
      before(function() {
        params = {
          'start': moment().subtract(1, 'day').format('YYYY-MM-DD'),
          'end': moment().subtract(2, 'day').format('YYYY-MM-DD')
        }
        validator = new Validator(params)
      })
      it('should be false', function() {
        validateResult.should.equal(false)
      })
      it('has expected error set', function() {
        validator.errors.start[0].should.match(/must begin with start date that comes before the end date/)
      })
    })
    context('start date to end date duration too large', function() {
      before(function() {
        params = {
          'start': moment().subtract(settings.validations.maxDuration+1, 'years').format('YYYY-MM-DD'),
          'end': moment().format('YYYY-MM-DD')
        }
        validator = new Validator(params)
      })
      it('should be false', function() {
        validateResult.should.equal(false)
      })
      it('has expected error set', function() {
        validator.errors.start[0].should.match(/must only span a maximum/)
        validator.errors.end[0].should.match(/must only span a maximum/)
      })
    })
  })

  describe('#hasErrors', function() {
    let errorsResult
    beforeEach(function() {
      errorsResult = validator.hasErrors()
    })
    context('no errors', function() {
      before(function() {
        validator.errors = {}
      })
      it('should be false', function() {
        errorsResult.should.equal(false)
      })
    })
    context('one error', function() {
      before(function() {
        validator.errors = { 'start': ['Graph data must include properly formatted start date.'] }
      })
      it('should be true', function() {
        errorsResult.should.equal(true)
      })
    })
  })
})

// https://github.com/andrewlock/auto-assign-issues/blob/master/test/auto-assign-issue.test.ts

// const nock = require('nock')
// Requiring our app implementation
const myProbotApp = require('..')
const { createProbot } = require('probot')
// Requiring our fixtures
const payload = require('./fixtures/pull_request.closed')
const deleteMergedBranch = require('../lib/deleter')

jest.mock('../lib/deleter', () => jest.fn())

describe('My Probot app', () => {
  let probot

  beforeEach(() => {
    probot = createProbot({ id: 1, cert: 'test', githubToken: 'test' })
    // Load our app into probot
    const app = probot.load(myProbotApp)
    app.app = { getSignedJsonWebToken: () => 'test' }
  })

  describe('Delete Branch functionality', () => {
    describe('It does not recieve the `pull_request.closed` event', () => {
      beforeEach(async () => {
        const name = 'pull_request'
        await probot.receive({
          name,
          payload: {
            ...payload,
            action: 'opened'
          }
        })
      })

      it('Should NOT call the deleteReference Method', () => {
        expect(deleteMergedBranch).not.toHaveBeenCalled()
      })
    })

    describe('It recieves the `pull_request.closed` event', () => {
      beforeEach(async () => {
        const name = 'pull_request'
        await probot.receive({ name, payload })
      })

      it('Should call the deleteReference method', () => {
        expect(deleteMergedBranch).toHaveBeenCalled()
      })
    })
  })
})

// For more information about testing with Jest see:
// https://facebook.github.io/jest/

// For more information about testing with Nock see:
// https://github.com/nock/nock

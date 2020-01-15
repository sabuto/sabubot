// https://github.com/andrewlock/auto-assign-issues/blob/master/test/auto-assign-issue.test.ts

// const nock = require('nock')
// Requiring our app implementation
const myProbotApp = require('..')
const { createProbot } = require('probot')
// Requiring our fixtures
const payload = require('./fixtures/pull_request.closed')
const comment = require('./fixtures/issue_comment.created')
const deleteMergedBranch = require('../lib/deleter')
const assignOwner = require('../lib/assign-owner')

jest.mock('../lib/deleter', () => jest.fn())
jest.mock('../lib/assign-owner', () => jest.fn())

describe('My Probot app', () => {
  let probot

  beforeEach(() => {
    probot = createProbot({ id: 1, cert: 'test', githubToken: 'test' })
    // Load our app into probot
    probot.load(myProbotApp)
    // app.app = { getSignedJsonWebToken: () => 'test' }
  })

  describe('Assign Owner functionality', () => {
    describe('It does not receive the `issue_comment.created` event', () => {
      beforeEach(async () => {
        const name = 'issue_comment'
        await probot.receive({
          name,
          payload: {
            ...comment,
            action: 'edited'
          }
        })
      })

      it('Should NOT call the assignOwner Method', () => {
        expect(assignOwner).not.toHaveBeenCalled()
      })
    })

    describe('It does recieve the `issue_comment.created` event', () => {
      beforeEach(async () => {
        const name = 'issue_comment'
        await probot.receive({ name, comment })

      it('Should call the assignOwner Method', () => {
        expect(assignOwner).toHaveBeenCalled()
      })
    })
  })

  describe('Delete Branch functionality', () => {
    describe('It does not receive the `pull_request.closed` event', () => {
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
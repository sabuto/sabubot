// https://github.com/andrewlock/auto-assign-issues/blob/master/test/auto-assign-issue.test.ts

const nock = require('nock')
// Requiring our app implementation
const myProbotApp = require('..')
const { createProbot } = require('probot')
// Requiring our fixtures
const payload = require('./fixtures/issues.opened')

describe('My Probot app', () => {
  let probot

  beforeEach(() => {
    nock.disableNetConnect()
    probot = createProbot({ id: 1, cert: 'test', githubToken: 'test' })
    // Load our app into probot
    probot.load(myProbotApp)
  })

  test('assigns repo owner when issue is created or edited when no assignee is present', async () => {

  })

  afterEach(() => {
    nock.cleanAll()
    nock.enableNetConnect()
  })
})

// For more information about testing with Jest see:
// https://facebook.github.io/jest/

// For more information about testing with Nock see:
// https://github.com/nock/nock

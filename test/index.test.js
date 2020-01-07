// https://github.com/andrewlock/auto-assign-issues/blob/master/test/auto-assign-issue.test.ts

const nock = require('nock')
// Requiring our app implementation
const myProbotApp = require('..')
const { Probot, createProbot } = require('probot')
// Requiring our fixtures
const payload = require('./fixtures/issues.opened')
const fs = require('fs')
const path = require('path')

describe('My Probot app', () => {
  let probot

  beforeEach(() => {
    nock.disableNetConnect()
    probot = createProbot({ id: 1, cert: 'test', githubToken: 'test' })
    // Load our app into probot
    probot.load(myProbotApp)
  })

  test('assigns repo owner when issue is created or edited when no assignee is present', async () => {
    const ownerAssignedBody = { assignees: ['sabutoss'] }

    // Test that we correctly return a test token
    nock('https://api.github.com')
      .post('/app/installations/2/access_tokens')
      .reply(200, { token: 'hhasdhashdhasdhasdh' })

    nock('https://api.github.com')
      .get('/repos/sabuto/bot-test/issues/25', (body) => {
        expect(body).toMatchObject(ownerAssignedBody)
        return true
      })
      .reply(200)

      // Recieve a webhook event
      await probot.receive({ name: 'issues', payload})
  })

  test('2 + 2 = 4', async () => {
    expect(2 + 2).toBe(4);
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

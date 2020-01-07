// https://github.com/andrewlock/auto-assign-issues/blob/master/test/auto-assign-issue.test.ts

const nock = require('nock')
// Requiring our app implementation
const myProbotApp = require('..')
const { Probot } = require('probot')
// Requiring our fixtures
// const payload = require('./fixtures/issues.opened')
const fs = require('fs')
const path = require('path')

describe('My Probot app', () => {
  let probot
  let mockCert

  beforeAll((done) => {
    fs.readFile(path.join(__dirname, 'fixtures/mock-cert.pem'), (err, cert) => {
      if (err) return done(err)
      mockCert = cert
      done()
    })
  })

  beforeEach(() => {
    nock.disableNetConnect()
    probot = new Probot({ id: 123, cert: mockCert })
    // Load our app into probot
    probot.load(myProbotApp)
  })

  test('assigns repo owner when issue is created or edited when no assignee is present', async () => {
    const ownerAssignedBody = { assignees: ['sabutoss'] }

    // Test that we correctly return a test token
    nock('https://api.github.com')
      .get('/app/installations/2/access_tokens')
      .reply(200, { token: 'hhasdhashdhasdhasdh' })

    nock('https://api.github.com')
      .get('/repos/sabuto/bot-test/issues/25', (body) => {
        expect(body).toMatchObject(ownerAssignedBody)
        return true
      })
      .reply(200)
  })

  test('2 + 2 = 4', async () => {
    expect(2 + 2).toBe(5);
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

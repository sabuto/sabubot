const closeIssue = require('../../lib/close-issue')
const payload = require('../fixtures/close_comment.created')

describe('closeIssue from comment function', () => {
  let context
  let createComment
  let deleteComment
  let update
  let getCollaboratorPermissionLevel

  beforeEach( () => {
    update = jest.fn().mockReturnValue(Promise.resolve())
    createComment = jest.fn().mockReturnValue(Promise.resolve())
    deleteComment = jest.fn().mockReturnValue(Promise.resolve())
    getCollaboratorPermissionLevel = jest.fn().mockReturnValue(Promise.resolve())

    context = {
      repo: jest.fn( (_, source)=> source),
      issue: {
        number: 123
      },
      config: jest.fn((_, defaults) => defaults),
      log: {
        info: jest.fn(),
        warn: jest.fn()
      },
      event: {
        event: 'issue_comment.created'
      },
      payload: JSON.parse(JSON.stringify(payload)),
      github: {
        issues: {
          update,
          createComment,
          deleteComment
        },
        repos: {
          getCollaboratorPermissionLevel
        }
      }
    }
  })

  describe('The user doesn\'t have permission to write',() => {

  })

  describe('User has permissions but issue is locked', () => {
    beforeEach(async () => {
      context.payload.issue.locked = true
      await closeIssue(context)
    })

    it('Should log it couldn\'t delete the comment', () => {
      expect(context.log.warn).toBeCalledWith(`Cannot delete comment on a locked thread.`)
    })
  })
})
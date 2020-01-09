const deleteMergedBranch = require('../../lib/deleter')
const payload = require('../fixtures/pull_request.closed')

describe('deleteMergedBranch function', () => {
  let context
  let deleteRef
  let owner
  let ref
  let repo

  beforeEach(() => {
    deleteRef = jest.fn().mockReturnValue(Promise.resolve())
    context = {
      config: jest.fn((_, defaults) => defaults),
      log: {
        info: jest.fn(),
        warn: jest.fn()
      },
      event: {
        event: 'pull_request.closed'
      },
      payload: JSON.parse(JSON.stringify(payload)),
      github: {
        git: {
          deleteRef
        }
      }
    }

    owner = payload.repository.owner.login
    ref = payload.pull_request.head.ref
    repo = payload.repository.name
  })

  describe('branch is merged from fork', () => {
    beforeEach(async () => {
      context.payload.pull_request.base.repo.id = 200
      context.payload.pull_request.head.repo.id = 100
      context.payload.pull_request.head.label = 'foo:bar'
      await deleteMergedBranch(context)
  })

    it('should log it didn\'t delete the branch', () => {
      expect(context.log.info).toBeCalledWith(`Closing PR from fork. keeping ${context.payload.pull_request.head.label}`)
    })

    it('Should NOT call deleteReference method', () => {
      expect(context.github.git.deleteRef).not.toHaveBeenCalled()
    })
  })

  describe('branch is merged', async () => {
    beforeEach(async () => {
    	context.payload.pull_request.merged = true
    	await deleteMergedBranch(context)
    })

    it('Should call the Deletereference method', () => {
      expect(context.github.git.deleteRef).toHaveBeenCalledWith({
        owner,
        ref: `heads/${ref}`,
        repo
      })
    })

    it('Should log the delete', () => {
    	expect(context.log.info).toBeCalledWith(`Successfully deleted ${owner}/${repo}/heads/${ref} which was merged`)
    })

    describe('deleteReference call fails', () => {
      beforeEach(async () => {
        context.github.git.deleteRef = jest.fn().mockReturnValue(Promise.reject(new Error()))
        await deleteMergedBranch(context)
      })

      it('Should log the error', () => {
      	expect(context.log.warn).toBeCalledWith(expect.any(Error), `Failed to delete ${owner}/${repo}/heads/${ref}`)
      })
    })
  })
})
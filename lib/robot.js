module.exports = class Sabubot {
  constructor (context) {
    this.context = context
    this.log = context.log
  }

  async getConfig() {
    this.config = await this.context.config('sabubot.yml')
  }

  async delete() {
    const headRepoId = this.context.payload.pull_request.head.repo.id
    const baseRepoID = this.context.payload.pull_request.base.repo.id

    const owner = this.context.payload.repository.owner.login
    const repo = this.context.payload.repository.name
    const branchName = this.context.payload.pull_request.head.ref
    const ref = `heads/${branchName}`

    if (headRepoId !== baseRepoID) {
      this.log.info(`Closing PR from fork. Keeping ${this.context.payload.pull_request.head.label}`)
      return
    }

    const isMerged = this.context.payload.pull_request.merged
    if (!isMerged && this.config.delete_closed_pr === false) {
      this.log.info(`PR was closed but not merged. Keeping ${owner}/${repo}/${ref}`)
      return
    }

    try {
      await this.context.github.git.deleteRef({ owner, repo, ref })
      this.log.info(`Successfully deleted ${owner}/${repo}/${ref} which was ${isMerged ? 'merged' : 'closed'}`)
    } catch (e) {
      this.log.warn(e, `Failed to delete ${owner}/${repo}/${ref}`)
    }
  }
}
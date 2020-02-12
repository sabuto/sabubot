const deleteMerged = require('./deleter')
// const label = require('./labeler')
const owner = require('./assign-owner')
const closeIssue = require('./close-issue')
module.exports = class Sabubot {
  constructor (context) {
    this.context = context
    this.log = context.log
  }

  async getConfig () {
    this.config = await this.context.config('sabubot.yml')
  }

  async delete () {
    await deleteMerged(this.context, this.config)
  }

  async owner () {
    await owner(this.context, this.log)
  }

  async close () {
    await closeIssue(this.context)
  }
}

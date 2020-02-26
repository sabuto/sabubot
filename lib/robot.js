const deleteMerged = require('./deleter')
const labelIssue = require('./label-issue')
const reviewer = require('./assign-reviewer')
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

  async reviewer () {
    await reviewer(this.context, this.log)
  }

  async close () {
    await closeIssue(this.context)
  }

}

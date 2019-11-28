const yaml = require('js-yaml')
const ignore = require('ignore')
const normalizeForSearch = require('normalize-for-search')

module.exports = class Assigner {
  constructor (log, context) {
    this.log = log
    this.context = context
    this.config = {}
    this.settings = {}
  }

  async init() {
    this.log.info("Assigner Init")
    this.issue = await this.getIssue()
    this.log.info("Recieved issue", this.issue.url)
    this.log.debug("Full Issue", this.issue)

    this.config = await this.getConfig()
    this.log.info("Fetched Config", this.config)

    if("settings" in this.config) {
      this.settings = this.config["settings"]
    }
    this.log.info("added these settings", this.settings)
  }

  async getIssue(){
    const issue = await this.context.github.issues.get(this.context.issue())
    return issue.data
  }

  async getConfig() {
    const content = await this.context.github.repos.getContents(this.context.repo({
      path: '.github/sabubot.yml'
    }))
    return yaml.safeLoad(Buffer.from(content.data.content, 'base64'). toString())
  }

  async assign(){
    this.currentAssignees = new Set(this.issue.assignees.map((val) => {
      return val.login
    }))

    this.newAssignees = new Set()
    const allAssignees = []

    this.log.info("Current Assignees", this.currentAssignees)

    if(this.settings["add-owner-assignee"]) {
      allAssignees['Sabuto']
    }

    this.log.info("we have these assignees to be added", this.allAssignees)

    this.context.github.issues.addAssignees(this.context.issue({allAssignees}))
  }
}
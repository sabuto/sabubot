const yaml = require('js-yaml')
const ignore = require('ignore')

module.exports = class Closer {
	constructor (app, context) {
		this.app = app
		this.log = app.log
		this.context = context
		this.config = {}
		this.settings = {}
	}

	async init() {
		this.log.info("Closer init")
		this.issue = await this.getIssue()
		this.log.info("Recieved Issue", this.issue.url)
		this.log.debug("Full Issue", this.issue)

		this.config = await this.getConfig()
    	this.log.info("Fetched Config", this.config)

    	if("settings" in this.config) {
      		this.settings = this.config["settings"]
      	}
	}
}
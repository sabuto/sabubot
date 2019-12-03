module.exports = class Mover {
  constructor (app, context, command) {
    this.log = app.log
    this.context = context
    this.command = command
    this.arguments = command.arguments || ''
    this.config = {}
    this.settings = {}
  }

  async init() {
  	this.log.info("Mover Init")
    this.issue = await this.getSource()
    // this.log.info("Command Recieved", this.issue.url)

    // this.config = await this.getConfig()
    // this.log.info("Fetched Config", this.config)

    // if("settings" in this.config) {
    //   this.settings = this.config["settings"]
    // }
    // this.log.info("added these settings", this.settings)
  }

  async getSource() {
  	const {payload, github: sourceGh} = this.context;

  	this.log.info("getSource", sourceGh)
  }

}
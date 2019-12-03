const yaml = require('js-yaml')
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
    // this.log.info("Command Recieved", this.issue.url)

    this.config = await this.getConfig()
    this.log.info("Fetched Config", this.config)

    // if("settings" in this.config) {
    //   this.settings = this.config["settings"]
    // }
    // this.log.info("added these settings", this.settings)

  	const {payload, github: sourceGh} = this.context;

  	this.log.info("getSource", this.context.issue().number)

  	const cmdUser = payload.comment.user.login;
    const cmdCommentId = payload.comment.id;
    const isCmdCommentContent = payload.comment.body.trim().includes('\n');

    this.log.info(
      {
        source,
        cmdUser,
        cmdCommentId,
        arguments: this.arguments.substring(0, 200),
        perform
      },
      'Command received'
    );
  }

  async getConfig() {
    const content = await this.context.github.repos.getContents(this.context.repo({
      path: '.github/sabubot.yml'
    }))
    return yaml.safeLoad(Buffer.from(content.data.content, 'base64'). toString())
  }

}
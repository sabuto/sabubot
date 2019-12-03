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

    if("settings" in this.config) {
      this.settings = this.config["settings"]
    }
    this.log.info("added these settings", this.settings)

    if(!this.settings['move-issues']) {
    	this.log.info("Move issues no set in settings.... skipping")
    	return false
    }
    const source = this.context.repo({
      issue_number: this.context.issue().number
    });
  	const {payload, github: sourceGh} = this.context

  	const cmdUser = payload.comment.user.login
    const cmdCommentId = payload.comment.id
    const isCmdCommentContent = payload.comment.body.trim().includes('\n')

    this.log.info(
      {
        source,
        cmdUser,
        cmdCommentId,
        arguments: this.arguments.substring(0, 200)
      },
      'Command received'
    )

    const sourcePermission = (await sourceGh.repos.getCollaboratorPermissionLevel(
      {
        owner: source.owner,
        repo: source.repo,
        username: cmdUser
      }
    )).data.permission

    if(!['write', 'admin'].includes(sourcePermission)) {
    	this.log.warn({source, cmdUser}, 'No user permission on the source')
    	await sourceGh.issues.createComment({
    		...source,
    		body: '⚠️ You must have write permission for the source repository.'
    	})
    	return false
    }

    let args = this.arguments.replace(/^\s*to (.*)$/i, '$1').trim()

    const targetArgs = args.split('/', 2)
    const target = {repo: targetArgs.pop().trim()}
    target.owner = targetArgs.length ? targetArgs[0].trim : source.owner

    if(!target.repo || target.owner.length > 39 || target.repo.length > 100) {
    	this.log.info(
    	{
    		source,
    		target,
    		cmdUser,
    		cmdCommentId,
    		arguments: this.arguments.substring(0, 200)
    	},
    	'Invalid Arguments'
    	)
    	await sourceGh.issues.createComment({
    		...source,
    		body:
    			'⚠️ The command arguments are not valid.\n\n' +
            	'**Usage:** \n```sh\n/move [to ][<owner>/]<repo>\n```'
    	})
    	return false
    }

    this.sameOwner = source.owner === target.owner
    if(this.sameOwner && source.repo === target.repo) {
    	this.log.info({source, target, perform}, 'Same source and target')
    	await sourceGh.issues.createComment({
          ...source,
          body: '⚠️ The source and target repository must be different.'
        })
        return false
  }

  async getConfig() {
    const content = await this.context.github.repos.getContents(this.context.repo({
      path: '.github/sabubot.yml'
    }))
    return yaml.safeLoad(Buffer.from(content.data.content, 'base64'). toString())
  }

}
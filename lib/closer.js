const yaml = require('js-yaml')
const ignore = require('ignore')

module.exports = class Closer {
	constructor (app, context, command) {
		this.log = app.log
		this.context = context
		this.config = {}
		this.settings = {}
		this.command = command
		this.arguments = command.arguments || ''
		this.robot = app
	}

	async init() {
		this.log.info("Closer init")

		this.config = await this.getConfig()
    	this.log.info("Fetched Config", this.config)

		if("settings" in this.config) {
				this.settings = this.config["settings"]
		}

		const source = this.context.repo({
			issue_number: this.context.issue().number
		})
		const {payload, github:sourceGh} = this.context

		const cmdUser = payload.comment.user.login
		const cmdCommentId = payload.comment.id
		const isCommandComment = payload.comment.body.trim().includes('\n')

		this.log.info(
			{
				source,
				cmdUser,
				cmdCommentId,
				arguments: this.arguments.substring(0, 200)
			},
			'Command Recieved'
		)

		const sourcePermission = (await sourceGh.repos.getCollaboratorPermissionLevel(
			{
				owner: source.owner,
				repo: source.repo,
				username: cmdUser
			}
		)).data.permission

		if(!['write', 'admin'].includes(sourcePermission)) {
			this.log.warn({source, cmdUser}, 'No User permission on the source')
			await sourceGh.issues.createComment({
				...source,
				body: '⚠️ You must have write permission for the source repository.'
			})
			return false
		}

		const cmdAuthorMention = this.getAuthorLink(cmdUser)

		this.log.info({source}, 'Closing Issue')

		if(!this.issueLocked) {
			if(isCommandComment) {
				this.log.info({ source, cmdCommentId }, 'Deleting Cmd')

				try {
					await sourceGh.issues.deleteComment({
						owner: source.owner,
						repo: source.repo,
						comment_id: cmdCommentId
					})
				} catch (e) {
					if (![403, 404].includes(e.code)) {
						throw e
					}
				}
			}

			try {
				await sourceGh.issues.createComment({
					...source,
					body:
						`This issue was closed by ${cmdAuthorMention}`
				})
			} catch (e) {
				if(e.code !== 403) {
					throw e
				}
			}
		}

		this.log.info('Closing Issue', source)

		await sourceGh.issues.update({...source, state: 'closed'})
	}

	get issueLocked(){
		return this.context.payload.issue.locked
	}

	getAuthorLink(user, mention = false) {
		const baseUrl = 'https://github.com'
		if(user.endsWith('[bot]')) {
			return `[${user}](${baseUrl}/apps/${user.replace('[bot]', '')}`
		}

		if(mention) {
			return `@${user}`
		}

		return `[${user}](${baseUrl}/${user})`
	}

	async getConfig() {
		const content = await this.context.github.repos.getContents(this.context.repo({
			path: '.github/sabubot.yml'
		}))
		return yaml.safeLoad(Buffer.from(content.data.content, 'base64'). toString())
	}
}
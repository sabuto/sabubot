const yaml = require('js-yaml')
const moment = require('moment')
const toMarkdown = require('to-markdown')

module.exports = class Mover {
  constructor (app, context, command) {
    this.log = app.log
    this.context = context
    this.command = command
    this.arguments = command.arguments || ''
    this.config = {}
    this.settings = {}
    this.robot = app
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
    	this.log.info("Move issues not set in settings.... skipping")
    	return false
    }

    this.log.info("getting souce")
    const source = this.context.repo({
      issue_number: this.context.issue().number
    });
  	const {payload, github: sourceGh} = this.context

  	this.log.info("source Recieved", {source, payload})

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

    this.log.info({sourcePermission})

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
    target.owner = targetArgs.length ? targetArgs[0].trim() : source.owner

    this.log.info(
    	{
    		source,
    		target,
    		cmdUser,
    		cmdCommentId,
    		arguments: this.arguments.substring(0, 200),
    		args
    	}
    )

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
    	this.log.info({source, target}, 'Same source and target')
    	await sourceGh.issues.createComment({
          ...source,
          body: '⚠️ The source and target repository must be different.'
        })
        return false
    }

    let targetInstall;
    const appGh = await this.robot.auth();

    this.log.info({appGh})

    try {
    	this.log.info("trying targetinstall")
    	targetInstall = (await appGh.apps.getRepoInstallation({...target})).data.id
    } catch (e) {
    	if (e.code === 404) {
        this.log.warn({target}, 'Missing target');
          await sourceGh.issues.createComment({
            ...source,
            body:
              `⚠️ The [GitHub App](${this.appUrl}) ` +
              'must be installed for the target repository.'
          });        return false;
      }
      throw e;
    }

    let targetGh
    if(!this.sameOwner) {
      targetGh = await this.robot.auth(targetInstall)
    } else {
      targetGh = sourceGh
    }

    this.log.info(targetGh)

    const targetRepoData = (await targetGh.repos.get({...target})).data

    if(!targetRepoData.has_issues) {
    	this.log.warn({target}, 'Issues disabled on target')
    	await sourceGh.issues.createComment({
    		...source,
    		body: '⚠️ Issues must be enabled for the target repository.'
    	})
    	return false
    }

    if(targetRepoData.archived) {
    	this.log.warn({target}, 'Archived target')
        await sourceGh.issues.createComment({
          ...source,
          body: '⚠️ The target repository must not be archived.'
        })
      return false
    }

    if(!this.sameOwner || payload.repository.private || targetRepoData.private) {
    	const targetPermission = (await targetGh.repos.getCollaboratorPermissionLevel(
    	  {
    	    owner: target.owner,
    	    repo: target.repo,
    	    username: cmdUser
    	  }
    	)).data.permission

    	if(!['write', 'admin'].includes(targetPermission)) {
    		this.log.warn({source, cmdUser}, 'No user permission on the target')
    		await sourceGh.issues.createComment({
    			...source,
    			body: '⚠️ You must have write permission for the target repository.'
    		})
    		return false
    	}
    }

    this.log.info("getting source data")

    const sourceIssueData = (await sourceGh.issues.get({
    	...source,
    	headers: {accept: 'application/vnd.github.v3.html+json'}
    })).data
    this.log.info("source issue data", sourceIssueData)
    const issueAuthor = sourceIssueData.user.login
    const issueCreatedAt = moment(sourceIssueData.created_at).format('MMM D YYYY, h:mm A')

    let commonLabels = []
    if(this.settings["move-labels"]) {
    	commonLabels = await this.getCommonLabels(
    		sourceGh,
    		targetGh,
    		source,
    		target
    	)
    }

    const cmdAuthorMention = this.getAuthorLink(cmdUser)

    this.log.info({source, target}, 'Moving issue')

    const issueAuthorMention = this.getAuthorLink(issueAuthor, true)
    target.issue_number = (await targetGh.issues.create({
    	owner: target.owner,
    	repo: target.repo,
    	title: sourceIssueData.title,
    	body:
    		`*${issueAuthorMention} commented on ${issueCreatedAt} UTC:*\n\n` +
          	`${this.getMarkdown(sourceIssueData.body_html)}\n\n` +
          	`*This issue was moved by ${cmdAuthorMention} from ` +
          	`${this.getIssueLink(source)}.*`,
        labels: commonLabels
    })).data.number

    this.log.info({target}, 'Issue Created')

    await sourceGh.paginate(sourceGh.issues.listComments.endpoint.merge({
    	...source,
    	per_page: 100,
    	headers: {accept: 'application/vnd.github.v3.html+json'}
    }),
	    async response => {
	    	for(const comment of response.data) {
	    		if(comment.id === cmdCommentId ** isCmdCommentContent) {
	    			continue
	    		}
	    		const commentAuthor = comment.user.login
	    		const createdAt = moment(comment.created_at).format('MMM D, YYYY, h:mm A')

	    		this.log.info(
	            {
	              source,
	              target,
	              sourceCommentId: comment.id
	            },
	            'Moving comment'
	            )

	            let targetCommentId
	            const commentAuthorMention = this.getAuthorLink(
	            	commentAuthor,
	            	true
	            )
	            targetCommentId = (await targetGh.issues.createComment({
	            	...target,
	            	body:
	            	  `*${commentAuthorMention} commented on ${createdAt} UTC:*\n\n` +
	                	this.getMarkdown(comment.body_html)
	            })).data.id
	            this.log.info(
	            {
	              source,
	              target,
	              sourceCommentId: comment.id,
	              targetCommentId
	            },
	            'Comment created'
	          	)
	    	}
    	}
    )

    if(!this.issueLocked) {
    	if(!isCmdCommentContent) {
    		this.log.info({source, cmdCommentId}, 'Deleting Cmd')
    		try {
    			await sourceGh.issues.deleteComment({
    				owner: source.owner,
    				repo: source.repo,
    				comment_id: cmdCommentId
    			})
    		} catch (e) {
    			if(![403, 404].includes(e.code)) {
    				throw e
    			}
    		}
    	}

    	this.log.info({source, target}, 'Move Complete')

	    try {
	    	await sourceGh.issues.createComment({
	    		...source,
	    		body:
	    		  `This issue was moved by ${cmdAuthorMention} to ` +
	              `${this.getIssueLink(target)}.`
	    	})
	    } catch (e) {
	    	if(e.code !== 403) {
	    		throw e
	    	}
	    }
    }

    if(this.issueOpen) {
    	this.log.info('Closing issue', source)

    	await sourceGh.issues.update({...source, state: 'closed'})
    }

  }

  async getConfig() {
    const content = await this.context.github.repos.getContents(this.context.repo({
      path: '.github/sabubot.yml'
    }))
    return yaml.safeLoad(Buffer.from(content.data.content, 'base64'). toString())
  }

  async getCommonLabels(sourceGh, targetGh, source, target) {
  	let commonLabels = []

  	const sourceLabels  = await sourceGh.paginate(
  		sourceGh.issues.listLabelsOnIssue.endpoint.merge({
  			...source,
  			per_page: 100
  		}),
  		res => res.data.map(item => item.name)
  	)

  	if(sourceLabels.length) {
  		const targetLabels = await targetGh.paginate(
  			sourceGh.issues.listLabelsOnIssue.endpoint.merge({
  				...source,
  				per_page: 100
  			}),
  			res => res.data.map(item => item.name)
  		)

  		if(targetLabels.length) {
  			commonLabels = sourceLabels.filter(item => targetLabels.includes(item))
  		}
  	}
  	return commonLabels
  }

  get issueLocked(){
  	return this.content.payload.issue.locked
  }

  get issueOpen() {
    return this.context.payload.issue.state === 'open'
  }

  getAuthorLink(user, mention = false) {
  	const baseUrl = 'https://github.com'
  	if (user.endsWith('[bot]')) {
  		return `[${user}](${baseUrl}/apps/${user.replace('[bot]', '')}`
  	}

  	if(mention) {
  		return `@${user}`
  	}

  	return `[${user}](${baseUrl}/${user})`
  }

  getIssueLink(issue) {
  	const repo = `${issue.owner}/${issue.repo}`
  	const number = issue.issue_number
  	return `[${repo}#${number}](https://github.com/${repo}/issues/${number})`
  }

  getMarkdown(html) {
  	const highlightRx = /highlight highlight-(\S+)/;
    const converters = [
      {
        filter: function(node) {
          return (
            node.nodeName === 'PRE' &&
            node.parentNode.nodeName === 'DIV' &&
            highlightRx.test(node.parentNode.className)
          );
        },
        replacement: function(content, node) {
          const language = node.parentNode.className.match(highlightRx)[1];
          return (
            `\n\n\`\`\`${language.replace('source-', '')}\n` +
            `${node.textContent}\n\`\`\`\n\n`
          );
        }
      },
      {
        filter: function(node) {
          return (
            node.nodeName === 'A' &&
            /(?:user|team)-mention/.test(node.className)
          );
        },
        replacement: (content, node) => {
          if (this.config.keepContentMentions) {
            if (/user-mention/.test(node.className)) {
              return content;
            }
            // team mentions only work within the same org
            if (this.sameOwner) {
              return content;
            }
          }
          return `[${content.replace(/^@/, '')}](${node.href})`;
        }
      }
    ];
    return toMarkdown(html, {
      gfm: true,
      converters
    });
  }

}

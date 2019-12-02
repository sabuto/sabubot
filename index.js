// const commands = require('probot-commands')
const Labeler = require("./lib/labeler")
const Assigner = require("./lib/assigner")
const Command = require("./lib/command")

/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
module.exports = app => {
  // Your code here
  app.log('Yay, the app was loaded!')

  // commands(robot, 'label', (context, command) => {
  //   robot.log("command", command)
  // })

  // app.on('push', async context => {
  //   app.log(context)
  // });

  app.on('issues.opened', label)
  app.on('issues.edited', label)
  app.on('issue_comment.*', comment)
  // app.on('issues.opened', async context => { 
  // 	// app.log(context.payload.issue.number)   
  //   // const issueComment = context.issue({ body: 'Thank you for contributing to the repo, someone will be along shortly for some more information or a fix!' })
  //   // return context.github.issues.createComment(issueComment)
  // });


  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/

 async function comment(context) {
   const command = new Command(app, context)

   await command.init()

   await command.processCommand()
 }

  async function label(context) {
	const labeler = new Labeler(app, context)

  	await labeler.init()

    await labeler.label()
  }

  async function assign(context) {
    const assigner = new Assigner(app.log, context)

    await assigner.init()

    await assigner.assign()

    // const tempParams = context.issue()
    // const owner = tempParams.owner

    // const addAssigneeParams = context.issue({ assignees: [owner]})
    // await context.github.issues.addAssignees(addAssigneeParams)
  }
}

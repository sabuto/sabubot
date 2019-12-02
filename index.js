const Labeler = require("./lib/labeler")
const Assigner = require("./lib/assigner")
const commands = require("probot-commands")

/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
module.exports = robot => {
  // Your code here
  robot.log('Yay, the app was loaded!')

  // app.on('push', async context => {
  //   app.log(context)
  // });

  robot.on('issues.opened', label)
  robot.on('issues.edited', label)
  commands(robot, 'close', (context, command) => {
    return robot.log.info("recieved command", command)
  })
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
   commands(robot, 'close', (context, command) => {
     robot.log("command Recieved", command)
   })
 }

  async function label(context) {
	const labeler = new Labeler(robot, context)

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

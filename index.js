const commands = require('probot-commands')
const Mover = require('./lib/mover')
const Labeler = require('./lib/label-issue')

// const assignOwner = require('./lib/assign-owner')

const Sabubot = require('./lib/robot')

/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
module.exports = robot => {
  // Your code here
  robot.log('Yay, the app was loaded!')

  commands(robot, 'move', async (context, command) => {
    const mover = new Mover(robot, context, command)

    await mover.init()
  })

  commands(robot, 'close', async (context) => {
    const sabubot = new Sabubot(context)
    await sabubot.close()
  })

  robot.on('issues.opened', issueOpened)
  robot.on('issues.edited', issueEdited)
  robot.on('pull_request.opened', prOpened)
  robot.on('pull_request.closed', prClosed)

  async function prClosed (context) {
    const sabubot = new Sabubot(context)
    await sabubot.getConfig()
    await sabubot.delete()
  }

  async function issueOpened (context) {
    const sabubot = new Sabubot(context)
    await sabubot.getConfig()
    await sabubot.owner()
    const label = new Labeler(robot, context)
    await label.init()
    await label.label()
  }

  async function issueEdited (context) {
    await issueOpened(context)
  }

  async function prOpened (context) {
    const label = new Labeler(robot, context)
    await label.getConfig()
    await label.init()
    await label.label()
    // const sabubot = new Sabubot(context)
    // await sabubot.getConfig()
    // await sabubot.reviewer()
  }
}

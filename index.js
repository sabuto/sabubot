const commands = require('probot-commands')
// const Labeler = require('./lib/labeler')
const Mover = require('./lib/mover')

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
  }

  async function issueEdited (context) {
    await issueOpened(context)
  }
}

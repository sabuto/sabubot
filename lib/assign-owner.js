module.exports = async (context) => {
  let settings
  const config = await context.config('sabubot.yml')
  // const issue = await context.github.issues.get(context.payload.issue.issue_number).data

  const owner = context.payload.repository.owner.login
  const repo = context.payload.repository.name

  if ('settings' in config) {
    settings = config.settings
  }

  context.log.info('Loaded settings:', { settings })

  if (settings['add-owner-assignee'] === true) {
    // context.github.issues
  }
}
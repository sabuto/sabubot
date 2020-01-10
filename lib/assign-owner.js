module.exports = async (context) => {
  let settings
  const config = await context.config('sabubot.yml')
  const issue = await context.github.issues.get(context.payload.issue.issue_number).data

  const owner = context.payload.repository.owner.login
  const repo = context.payload.repository.name

  context.log.info(`testing the context.payload payload: ${context.payload}`)

  if ('settings' in config) {
    settings = config.settings
  }

  if (settings.add-owner-assignee === true) {
    // context.github.issues
    
  }
}
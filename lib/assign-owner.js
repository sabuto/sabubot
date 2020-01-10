module.exports = async (context) => {
  let settings
  const config = await context.config('sabubot.yml')
  // const issue = await context.github.issues.get(context.payload.issue.issue_number).data

  const owner = context.payload.repository.owner.login
  const repo = context.payload.repository.name
  const issueNumber = context.issue().number

  if ('settings' in config) {
    settings = config.settings
  }

  if (settings['add-owner-assignee'] === false) {
    context.log.info('Change add-owner-assignee in settings if you want to add owner of repo to assignees')
    return
  }

  let allAssignees = new Set()
  
  allAssignees = owner

  context.log.info('owner', { owner, issueNumber, allAssignees })
}
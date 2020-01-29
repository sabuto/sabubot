module.exports = async (context) => {
  let settings = {}
  const config = await context.config('sabubot.yml')
  // const issue = await context.github.issues.get(context.payload.issue.issue_number).data

  const owner = context.payload.repository.owner.login

  if ('settings' in config) {
    settings = config.settings
  }

  if (settings['add-owner-assignee'] === false) {
    context.log.info('Change add-owner-assignee in settings if you want to add owner of repo to assignees')
    return
  }

  let allAssignees = owner

  context.log.info()

  try {
    await context.github.issues.addAssignees(context.issue({ assignees: [allAssignees] }))
    context.log.info(`Successfully added ${allAssignees} to the issue`)
  } catch (e) {
    context.log.warn(e, `Failed to add ${allAssignees} to the issue`)
  }
}

module.exports = async (context, mainLog) => {
  let settings = {}
  const config = mainLog
  // const issue = await context.github.issues.get(context.payload.issue.issue_number).data

  const owner = context.payload.repository.owner.login

  if ('settings' in config) {
    settings = config.settings
  }

  if (settings['add-owner-reviewer'] === false) {
    context.log.info('Change add-owner-reviewer in settings if you want to add owner of repo to reviewers')
    return
  }

  const allReviewers = owner

  try {
    await context.github.pulls.createReviewRequest(context.issue({ reviewers: [allReviewers] }))
    context.log.info(`Successfully added ${allReviewers} to the pr`)
  } catch (e) {
    context.log.warn(e, `Failed to add ${allReviewers} to the pr`)
  }
}

module.exports = async (context) => {
  // let settings
  // const config = await context.config('sabubot.yml')

  // if ('settings' in config) {
  //   settings = config.settings
  // }

  const source = context.repo({
    issue_number: context.issue().number
  })

  const { payload, github: sourceGh } = context

  const cmdUser = payload.comment.user.login
  const cmdCommentId = payload.comment.id
  const isCommandComment = payload.comment.body.trim().includes('\n')

  const sourcePermission = (await sourceGh.repos.getCollaboratorPermissionLevel(
    {
      owner: source.owner,
      repo: source.repo,
      username: cmdUser
    }
  )).data.permission

  if (!['write', 'admin'].includes(sourcePermission)) {
    context.log.warn({ source, cmdUser }, 'The user doesn\'t have permission to do that!')
    try {
      await sourceGh.issues.createComment({
        ...source,
        body: '⚠️ You must have write permission for the source repository.'
      })
      context.log.info('Successfully wrote a comment')
    } catch (e) {
      context.log.warn(e, 'Failed to write a comment on the issue')
    }
    return
  }

  if (!context.payload.issues.locked) {
    if (isCommandComment) {
      try {
        await sourceGh.issues.deleteComment({
          owner: source.owner,
          repo: source.repo,
          comment_id: cmdCommentId
        })
        context.log.info('Successfully deleted the comment')
      } catch (e) {
        context.log.warn(e, 'Comment not deleted')
      }
    }
  }

  try {
    await sourceGh.issues.update({ ...source, state: 'closed' })
    context.log.info('Issue has been closed')
  } catch (e) {
    context.log.info(e, 'Issue has not been locked')
  }
}

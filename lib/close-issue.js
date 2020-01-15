module.exports = async (context) => {
  let settings
  const config = await context.config('sabubot.yml')

  if ('settings' in config) {
    settings = config.settings
  }

  const source = context.repo({
    issue_number: context.issue().number
  })

  const { payload, github: sourceGh } = context

  context.log.info(
    {
      source,
      payload,
      sourceGh,
      settings
    }
  )
}

module.exports = async (context) => {
  let settings
  const config = await context.config('sabubot.yml')

  if ('settings' in config) {
    settings = config.settings
  }

  const source = this.context.repo({
    issue_number: this.context.issue().number
  })
}
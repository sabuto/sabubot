module.exports = async (context) {
  const config = await context.config('sabubot.yml')

  context.log.info(`Testing the log`)
}
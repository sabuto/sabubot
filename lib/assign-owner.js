module.exports = async (context) => {
	const config = await context.config('sabubot.yml')
	const issue = await context.github.issues.get(context.issue()).data

	context.log.info(`starting the new assigner, here the config: ${config}`)
}
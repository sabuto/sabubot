/*
https://github.com/vansante/github-pr-labeler/blob/master/lib/pr-labeler.js
*/

module.exports = class Labeler {
	constructor (log, context) {
		this.log = log
		this.context = context
	}

	async init() {
		this.issue = await this.getIssue()
		this.log.info("Recieved Issue", this.issue.url)
		this.log.debug("Full Issue", this.issue)
	}

	async getIssue() {
		const issue = await this.context.github.issues.get(this.context.issue)
		return issue.data
	}
}
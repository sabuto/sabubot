const Labeler = require("./lib/labeler")
/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
module.exports = app => {
  // Your code here
  app.log('Yay, the app was loaded!')

  app.on('push', async context => {
    app.log(context)
  });

  app.on('issues.opened', label)
  
  app.on('issues.opened', async context => { 
  	// app.log(context.payload.issue.number)   
    // const issueComment = context.issue({ body: 'Thank you for contributing to the repo, someone will be along shortly for some more information or a fix!' })
    // return context.github.issues.createComment(issueComment)
  });


  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/

  async function label(context) {
	const labeler = new Labeler(app.log, context)

  	await labeler.init()
  }
}

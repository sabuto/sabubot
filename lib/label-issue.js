const yaml = require('js-yaml')
const normalizeForSearch = require('normalize-for-search')
// const commands = require('probot-commands')

module.exports = class Labeler {
  constructor (app, context) {
    this.app = app
    this.log = app.log
    this.context = context
    this.config = {}
    this.settings = {}
  }

  async init () {
    // if (this.settings['close-issues']) {
    // return this.checkForClose()
    // }
    this.log.info('Labeler init')
    this.issue = await this.getIssue()
    this.log.info('Recieved Issue', this.issue.url)
    this.log.debug('Full Issue', this.issue)

    this.config = await this.getConfig()
    this.log.info('Fetched Config', this.config)

    if ('settings' in this.config) {
      this.settings = this.config.settings
    }
  }

  async getConfig () {
    const content = await this.context.github.repos.getContents(this.context.repo({
      path: '.github/sabubot.yml'
    }))
    return yaml.safeLoad(Buffer.from(content.data.content, 'base64').toString())
  }

  async getIssue () {
    const issue = await this.context.github.issues.get(this.context.issue())
    return issue.data
  }

  async label () {
    this.currentLabels = new Set(this.issue.labels.map((val) => {
      return val.name
    }))
    this.log.info('Current Labels', this.currentLabels)

    this.newLabels = new Set()
    this.allLabels = new Set()

    if (this.issue.state === 'closed') {
      if (!this.settings['process-closed-issues']) {
        this.log.info('Issue Closed.... Skipping')
        return false
      }
    }

    if ('title-keyword-labels' in this.config) {
      this.labelKeywords(this.config['title-keyword-labels'], this.issue.title)
    }

    // Calculate labels to remove
    const labelsToRemove = Array.from(this.allLabels).filter((value) => {
      return !this.newLabels.has(value) && this.currentLabels.has(value)
    })

    // Calculate labels to add
    const labelsToAdd = Array.from(this.newLabels).filter((value) => {
      return !this.currentLabels.has(value)
    })

    if (labelsToAdd.length > 0) {
      this.log.info('adding Labels', labelsToAdd)
      this.context.github.issues.addLabels(this.context.issue({
        labels: labelsToAdd
      }))
    } else {
      this.log.info('No Labels to add')
    }

    if (this.settings['remove-labels']) {
      if (labelsToRemove.length > 0) {
        this.log.info('removing these labels', labelsToRemove)
        for (const label of labelsToRemove) {
          this.context.github.issues.removeLabel(this.context.issue({
            name: label
          }))
        }
      } else {
        this.log.info('No labels to remove')
      }
    } else {
      this.log.info('Would have removed', labelsToRemove)
    }
    return true
  }

  labelKeywords (keywordsConfig, textToSearch) {
    for (const label in keywordsConfig) {
      if (this.settings['remove-keyword-labels']) {
        this.allLabels.add(label)
      }

      const keywords = this.ensureArray(keywordsConfig[label])
      const normalizedText = normalizeForSearch(textToSearch)
      for (const keyword of keywords) {
        this.log.info('Checking for keyword', label, keyword)

        if (normalizedText.indexOf(keyword.toLowerCase()) >= 0) {
          this.log.info('Found Keyword, applying label', label, keyword)
          this.newLabels.add(label)
        }
      }
    }
  }

  // checkForClose() {
  //  commands(this.app, 'close', (context, command) => {
  //    this.log.info("testing the close command")
  //  })
  // }

  ensureArray (val) {
    if (!Array.isArray(val)) {
      return [val]
    }
    return val
  }
}
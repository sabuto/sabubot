module.exports = class Sabubot {
  constructor (context) {
    this.context = context
  }

  async delete() {
    this.context.log.info(`Context Recieved ${this.context}`)
  }
}
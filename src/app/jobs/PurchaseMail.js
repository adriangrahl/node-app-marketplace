const Mail = require('../services/Mail')

class PurchaseMail {
  get key () {
    return 'PurchaseMail'
  }

  async handle (job, done) {
    const { ad, user, content } = job.data

    await Mail.sendMail({
      from: '"Adrian Pereira" <adrian.grahl@gmail.com>',
      to: ad.author.email,
      subject: `Purchase request: ${ad.title}`,
      template: 'purchase',
      context: {
        user,
        content,
        ad
      }
    })

    return done()
  }
}

module.exports = new PurchaseMail()

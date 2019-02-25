const Ad = require('../models/Ad')
const Purchase = require('../models/Purchase')
const User = require('../models/User')
const Queue = require('../services/Queue')
const PurchaseMail = require('../jobs/PurchaseMail')

class PurchaseController {
  async index (req, res) {
    const purchases = await Purchase.paginate(
      {},
      {
        populate: ['ad'],
        page: req.query.page || 1,
        limit: 20,
        sort: '-createdAt'
      }
    )

    return res.json(purchases)
  }
  async store (req, res) {
    const { ad, content } = req.body
    const purchaseAd = await Ad.findById(ad).populate('author')

    if (purchaseAd.purchasedBy) {
      return res
        .status(400)
        .json({ error: 'This ad has already been purchased' })
    }

    const user = await User.findById(req.userId)

    const purchase = await Purchase.create({ ...req.body })

    Queue.create(PurchaseMail.key, {
      ad: purchaseAd,
      user,
      content
    }).save()

    return res.json(purchase)
  }
  async accept (req, res) {
    const { id } = req.params
    const { ad } = await Purchase.findById(id).populate({
      path: 'ad',
      populate: {
        path: 'author'
      }
    })

    if (!ad.author._id.equals(req.userId)) {
      return res.status(401).json({ error: "You're not the ad author" })
    }

    if (ad.purchasedBy) {
      return res
        .status(400)
        .json({ error: 'This ad had already been purchased' })
    }

    ad.purchasedBy = id
    await ad.save()

    return res.json(ad)
  }
}

module.exports = new PurchaseController()

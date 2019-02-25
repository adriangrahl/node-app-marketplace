const User = require('../models/User')

class UserController {
  async store (req, res) {
    const { email } = req.body

    if (await User.findOne({ email })) {
      return res.status(400).json({ error: 'User already exists' })
    }

    try {
      const user = await User.create(req.body)
      return res.json(user)
    } catch (error) {
      return res.status(400).json({ error: error.message })
    }
  }
}

module.exports = new UserController()

const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'wishlist',
      select: '-reviews',
    });
    res.json(user.wishlist);
  } catch (err) {
    next(err);
  }
});

// adds the product if it isn't saved yet, removes it otherwise
router.post('/:productId', protect, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const user = await User.findById(req.user._id);
    const idx = user.wishlist.findIndex((id) => id.toString() === req.params.productId);
    if (idx >= 0) user.wishlist.splice(idx, 1);
    else user.wishlist.push(product._id);
    await user.save();

    res.json({ ids: user.wishlist.map((id) => id.toString()) });
  } catch (err) {
    next(err);
  }
});

// just the ids, handy for showing heart icons
router.get('/ids', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ ids: user.wishlist.map((id) => id.toString()) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

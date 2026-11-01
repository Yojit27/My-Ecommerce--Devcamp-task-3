const express = require('express');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const sorts = {
  newest: { createdAt: -1 },
  'price-asc': { price: 1 },
  'price-desc': { price: -1 },
  rating: { rating: -1 },
};

// GET /api/products?q=&category=&minPrice=&maxPrice=&sort=&page=&limit=
router.get('/', async (req, res, next) => {
  try {
    const { q, category, minPrice, maxPrice, sort = 'newest' } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 8, 50);

    const filter = {};
    if (q) filter.name = { $regex: escapeRegex(q), $options: 'i' };
    if (category && category !== 'All') filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .select('-reviews')
      .sort(sorts[sort] || sorts.newest)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ products, page, pages: Math.ceil(total / limit) || 1, total });
  } catch (err) {
    next(err);
  }
});

router.get('/categories', async (req, res, next) => {
  try {
    const cats = await Product.distinct('category');
    res.json(cats.sort());
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

const checkProductBody = (b) => {
  if (!b.name || !b.name.trim()) return 'Product name is required';
  if (!b.description || !b.description.trim()) return 'Description is required';
  if (b.price === undefined || isNaN(b.price) || Number(b.price) < 0) return 'Enter a valid price';
  const isUpload = /^data:image\/(jpeg|png|webp);base64,/.test(b.image || '');
  const isUrl = /^https?:\/\//.test(b.image || '');
  if (!isUpload && !isUrl) return 'Please upload a JPG or PNG image';
  if (isUpload && b.image.length > 600000) return 'Image is too large, choose a smaller one';
  if (!b.category || !b.category.trim()) return 'Category is required';
  if (b.stock !== undefined && (isNaN(b.stock) || Number(b.stock) < 0)) return 'Enter a valid stock number';
  return null;
};

router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    const problem = checkProductBody(req.body);
    if (problem) return res.status(400).json({ message: problem });
    const { name, description, price, image, category, stock } = req.body;
    const product = await Product.create({ name, description, price, image, category, stock });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const problem = checkProductBody(req.body);
    if (problem) return res.status(400).json({ message: problem });
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const { name, description, price, image, category, stock } = req.body;
    Object.assign(product, { name, description, price, image, category });
    if (stock !== undefined) product.stock = stock;
    await product.save();
    res.json(product);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    await product.deleteOne();
    res.json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
});

// reviews
router.post('/:id/reviews', protect, async (req, res, next) => {
  try {
    const rating = Number(req.body.rating);
    const comment = (req.body.comment || '').trim();
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    if (!comment) return res.status(400).json({ message: 'Please write a short comment' });

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const already = product.reviews.find((r) => r.user.toString() === req.user._id.toString());
    if (already) return res.status(400).json({ message: 'You already reviewed this product' });

    product.reviews.push({ user: req.user._id, name: req.user.name, rating, comment });
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length;
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

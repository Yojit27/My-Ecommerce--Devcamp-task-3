const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

const STATUSES = ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

// place an order - prices are re-read from the DB so the client can't fake them
router.post('/', protect, async (req, res, next) => {
  try {
    const { items, shipping } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty' });
    }
    const required = ['fullName', 'phone', 'address', 'city', 'postalCode'];
    for (const field of required) {
      if (!shipping || !shipping[field] || !String(shipping[field]).trim()) {
        return res.status(400).json({ message: `Delivery detail missing: ${field}` });
      }
    }
    if (!/^\d{10}$/.test(String(shipping.phone).replace(/\s/g, ''))) {
      return res.status(400).json({ message: 'Phone number must be 10 digits' });
    }

    const orderItems = [];
    let totalPrice = 0;
    for (const item of items) {
      const qty = parseInt(item.qty);
      if (!qty || qty < 1) return res.status(400).json({ message: 'Invalid quantity' });
      const product = await Product.findById(item.product);
      if (!product) return res.status(400).json({ message: 'A product in your cart no longer exists' });
      if (product.stock < qty) {
        return res.status(400).json({ message: `Only ${product.stock} left of ${product.name}` });
      }
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        qty,
      });
      totalPrice += product.price * qty;
    }

    // reduce stock only after everything has been validated
    for (const it of orderItems) {
      await Product.findByIdAndUpdate(it.product, { $inc: { stock: -it.qty } });
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shipping,
      totalPrice,
    });
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

router.get('/mine', protect, async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// admin: all orders
router.get('/', protect, adminOnly, async (req, res, next) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

router.put('/:id/status', protect, adminOnly, async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.status = status;
    await order.save();
    res.json(order);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

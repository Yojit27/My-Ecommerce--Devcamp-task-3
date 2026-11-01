require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const connectDB = require('./config/db');

// product images use picsum.photos with a fixed seed so every product keeps the same picture
const img = (seed) => `https://picsum.photos/seed/${seed}/600/600`;

const products = [
  { name: 'Wireless Headphones', category: 'Electronics', price: 2499, stock: 25, image: img('headphones'), description: 'Over-ear Bluetooth headphones with soft cushions and about 30 hours of battery life.' },
  { name: 'Smart Watch', category: 'Electronics', price: 3999, stock: 18, image: img('smartwatch'), description: 'Fitness tracking, heart rate monitor, sleep tracking and call notifications on your wrist.' },
  { name: 'Portable Power Bank 20000mAh', category: 'Electronics', price: 1299, stock: 40, image: img('powerbank'), description: 'Fast charging power bank with two USB ports. Keeps a phone going for about four full charges.' },
  { name: 'Bluetooth Speaker', category: 'Electronics', price: 1799, stock: 30, image: img('speaker'), description: 'Compact water resistant speaker with deep bass and 12 hour playtime.' },
  { name: 'Mechanical Keyboard', category: 'Electronics', price: 3299, stock: 15, image: img('keyboard'), description: 'Tactile blue switches, backlit keys and a sturdy aluminium top plate.' },
  { name: 'Cotton Crew T-Shirt', category: 'Clothing', price: 499, stock: 60, image: img('tshirt'), description: 'Soft 100% cotton t-shirt with a relaxed fit. Easy to pair with jeans or shorts.' },
  { name: 'Slim Fit Denim Jeans', category: 'Clothing', price: 1499, stock: 35, image: img('jeans'), description: 'Stretchable denim with a slim fit and five pockets. Washes well and keeps its colour.' },
  { name: 'Hooded Sweatshirt', category: 'Clothing', price: 1199, stock: 28, image: img('hoodie'), description: 'Warm fleece lined hoodie with a front pocket and adjustable drawstring.' },
  { name: 'Running Shoes', category: 'Clothing', price: 2799, stock: 22, image: img('shoes'), description: 'Lightweight mesh running shoes with a cushioned sole and good grip.' },
  { name: 'The Pragmatic Programmer', category: 'Books', price: 899, stock: 50, image: img('programmerbook'), description: 'A practical guide to becoming a better developer, full of tips that apply to any language.' },
  { name: 'Atomic Habits', category: 'Books', price: 549, stock: 70, image: img('habitsbook'), description: 'An easy to follow guide on building good habits and breaking bad ones, one small change at a time.' },
  { name: 'Ruled Notebook Pack of 3', category: 'Books', price: 299, stock: 80, image: img('notebooks'), description: 'A5 ruled notebooks with 160 pages each and thick paper that does not bleed.' },
  { name: 'Ceramic Coffee Mug Set', category: 'Home', price: 799, stock: 45, image: img('mugs'), description: 'Set of four glazed ceramic mugs, microwave and dishwasher safe.' },
  { name: 'LED Desk Lamp', category: 'Home', price: 999, stock: 33, image: img('desklamp'), description: 'Adjustable arm lamp with three brightness levels and a touch control.' },
  { name: 'Stainless Steel Water Bottle', category: 'Home', price: 649, stock: 55, image: img('bottle'), description: 'Insulated 750ml bottle that keeps drinks cold for 24 hours or hot for 12.' },
  { name: 'Cotton Bedsheet Set', category: 'Home', price: 1899, stock: 20, image: img('bedsheet'), description: 'Double bedsheet with two pillow covers in a breathable cotton weave.' },
  { name: 'Yoga Mat', category: 'Sports', price: 749, stock: 38, image: img('yogamat'), description: 'Non slip 6mm yoga mat with a carry strap. Comfortable on hard floors.' },
  { name: 'Adjustable Dumbbell Pair', category: 'Sports', price: 2999, stock: 12, image: img('dumbbell'), description: 'Pair of adjustable dumbbells, 2 to 10 kg each, with a quick lock system.' },
  { name: 'Badminton Racket Set', category: 'Sports', price: 1099, stock: 26, image: img('badminton'), description: 'Two lightweight rackets, three shuttlecocks and a carry bag.' },
];

const run = async () => {
  await connectDB();

  await Product.deleteMany();
  await Product.insertMany(products);
  console.log(`Inserted ${products.length} products`);

  const email = (process.env.ADMIN_EMAIL || 'admin@shop.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    console.log('ADMIN_PASSWORD not set in .env, skipping admin user creation');
  } else {
    let admin = await User.findOne({ email });
    if (admin) {
      admin.role = 'admin';
      admin.password = password;
      await admin.save();
    } else {
      await User.create({ name: 'Admin', email, password, role: 'admin' });
    }
    console.log(`Admin user ready: ${email}`);
  }

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

# ShopEasy - MERN E-Commerce

A full-stack online store built for DevCamp 2.0 (Task 3). Users can browse products, search and filter, manage a cart, register and log in, place orders and see their order history. Admins can manage products and update order status.

**Stack:** React (Vite), React Router, Node.js, Express.js, MongoDB (Mongoose), JWT, bcryptjs. Styling is plain CSS.

## Features

- Home page with navbar, hero search, category chips, price filter, sorting and pagination
- Product details page with ratings and reviews
- Register / login with hashed passwords (bcrypt) and JWT auth, protected routes and APIs
- Cart with quantity controls, remove, live subtotal and total (kept in localStorage)
- Checkout form, order summary, order stored in MongoDB, order history with a status tracker
- Wishlist
- Admin: add / edit / delete products (image upload), view all orders, change order status
- Loaders, toast notifications, empty states, responsive layout (mobile and desktop)

Payment gateway is intentionally not included (orders are cash on delivery).

## Project structure

```
my-ecommerce/
  client/     React frontend
    src/components   Navbar, ProductCard, CartItem, OrderSummary, ...
    src/pages        Home, ProductDetails, Login, Cart, Checkout, Orders, admin pages
    src/context      Auth, Cart, Wishlist, Toast state
  server/     Express backend
    models/          User, Product, Order
    routes/          auth, products, orders, wishlist
    middleware/      JWT auth, error handling
    seed.js          sample products + admin user
  .github/workflows/deploy.yml   GitHub Pages deploy for the frontend
```

## Run it locally

You need Node.js 18+ and a MongoDB database (a free MongoDB Atlas cluster works, or a local MongoDB).

### 1. Backend

```bash
cd server
npm install
cp .env.example .env     # then fill in the values
npm run seed             # inserts sample products and the admin user
npm run dev              # http://localhost:5000
```

### 2. Frontend

```bash
cd client
npm install
cp .env.example .env
npm run dev              # http://localhost:5173
```

## Environment variables

Names only. Never commit real values. `.env` is in `.gitignore`.

**server/.env**

| Name | What it is |
| --- | --- |
| `PORT` | Port for the API (default 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Long random string used to sign tokens |
| `CLIENT_URL` | Allowed frontend origin(s), comma separated (e.g. your GitHub Pages origin) |
| `ADMIN_EMAIL` | Email of the admin account created by `npm run seed` |
| `ADMIN_PASSWORD` | Password of that admin account |

**client/.env**

| Name | What it is |
| --- | --- |
| `VITE_API_URL` | Base URL of the API, including `/api` |

## API overview

| Method | Route | Access |
| --- | --- | --- |
| POST | `/api/auth/register`, `/api/auth/login` | public |
| GET | `/api/auth/me` | logged in |
| GET | `/api/products` (`q`, `category`, `minPrice`, `maxPrice`, `sort`, `page`, `limit`) | public |
| GET | `/api/products/categories`, `/api/products/:id` | public |
| POST / PUT / DELETE | `/api/products`, `/api/products/:id` | admin |
| POST | `/api/products/:id/reviews` | logged in |
| POST | `/api/orders` | logged in |
| GET | `/api/orders/mine` | logged in |
| GET | `/api/orders`, PUT `/api/orders/:id/status` | admin |
| GET / POST | `/api/wishlist`, `/api/wishlist/:productId` | logged in |

## Deployment

GitHub Pages only serves static files, so the app is deployed in two parts: the React frontend on GitHub Pages, and the Express API on Render with the database on MongoDB Atlas.

### A. Database (MongoDB Atlas)

1. Create a free cluster and a database user.
2. Under Network Access allow `0.0.0.0/0` (Render uses changing IPs).
3. Copy the connection string; this is your `MONGO_URI`.
4. Run `npm run seed` once from your computer (with `MONGO_URI` in `server/.env`) to add sample products and the admin user.

### B. Backend (Render)

1. Push the repo to GitHub.
2. On Render create a **Web Service** from the repo with:
   - Root directory: `server`
   - Build command: `npm install`
   - Start command: `npm start`
3. Add the environment variables `MONGO_URI`, `JWT_SECRET` and `CLIENT_URL`.
   `CLIENT_URL` must be the origin of your Pages site, for example `https://your-username.github.io` (no path, no trailing slash).
4. Deploy. Your API URL will look like `https://your-service.onrender.com`.

The free Render tier sleeps after inactivity, so the first request can take around 30-60 seconds.

### C. Frontend (GitHub Pages)

1. In the repo go to **Settings > Pages** and set the source to **GitHub Actions**.
2. Go to **Settings > Secrets and variables > Actions > Variables** and add a repository variable:
   `VITE_API_URL` = `https://your-service.onrender.com/api`
3. Push to the `main` branch (or run the workflow manually from the Actions tab). The workflow in `.github/workflows/deploy.yml` builds the client and publishes it.
4. Your site will be at `https://your-username.github.io/your-repo-name/`.

The router uses `HashRouter` and Vite uses a relative base, so no repo name needs to be configured and page refreshes work on GitHub Pages.

## Admin access

Run `npm run seed` after setting `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `server/.env`, then log in with those. Admin links (Manage Products, All Orders) appear in the navbar.

Running the seed again resets the products collection.

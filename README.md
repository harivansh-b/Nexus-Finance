# Nexus Finance - Setup & Deployment Guide

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account
- Stripe account
- Resend account
- Clerk account (optional, for Clerk authentication)

### Installation

#### 1. Clone Repository
```bash
cd e:/Nexus-Finance
```

#### 2. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Add your configuration to .env:
# - MONGODB_URI: Your MongoDB connection string
# - JWT_SECRET: Generate a secret key (min 32 characters)
# - STRIPE_SECRET_KEY: From your Stripe dashboard
# - STRIPE_WEBHOOK_SECRET: From Stripe webhooks
# - RESEND_API_KEY: From your Resend account
# - CLERK_SECRET_KEY: From Clerk dashboard (if using Clerk)

# Start development server
npm run dev
```

The backend will run on `http://localhost:5000`

#### 3. Frontend Setup

```bash
cd ../client

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update VITE_API_URL if needed (default is http://localhost:5000)

# Start development server
npm run dev
```

The frontend will run on `http://localhost:5173`

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/clerk-webhook` - Clerk webhook handler

### Crypto Data
- `GET /api/crypto/list` - Get top cryptocurrencies
- `GET /api/crypto/:coingeckoId` - Get crypto details
- `GET /api/crypto/search/:query` - Search cryptocurrencies
- `GET /api/crypto/:coingeckoId/history` - Get price history

### Trading (Protected)
- `POST /api/trade/buy` - Buy cryptocurrency
- `POST /api/trade/sell` - Sell cryptocurrency
- `GET /api/trade/portfolio` - Get user portfolio
- `GET /api/trade/portfolio/summary` - Get portfolio summary
- `GET /api/trade/transactions` - Get transaction history
- `GET /api/trade/watchlist` - Get watchlist
- `POST /api/trade/watchlist/add` - Add coin to watchlist
- `POST /api/trade/watchlist/remove` - Remove coin from watchlist

### Payments (Protected)
- `POST /api/razorpay/create-order` - Create Razorpay order
- `POST /api/razorpay/verify-payment` - Verify payment
- `GET /api/razorpay/payments` - Get payment history

### Email
- `POST /api/email/send-welcome` - Send welcome email
- `POST /api/email/send-transaction` - Send transaction email
- `POST /api/email/send-payment-confirmation` - Send payment confirmation
- `POST /api/email/send-login-alert` - Send login alert

---

## Environment Variables

### Server (.env)
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_min_32_chars
CLERK_SECRET_KEY=your_clerk_secret
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_key_secret
RESEND_API_KEY=re_...
CLIENT_URL=http://localhost:5173
COINGECKO_API_KEY=optional_for_pro
```

### Client (.env)
```
VITE_API_URL=http://localhost:5000
VITE_CLERK_PUBLISHABLE_KEY=your_public_key
VITE_RAZORPAY_KEY_ID=rzp_test_...
```

---

## Testing the Application

### 1. User Authentication
- Navigate to http://localhost:5173
- Click "Sign Up" and create an account
- Alternatively, use "Login" with existing credentials

### 2. View Crypto Dashboard
- After login, you'll see top 50 cryptocurrencies
- Each card shows: name, symbol, current price, 24h change
- Search bar allows filtering cryptocurrencies

### 3. Buy Cryptocurrency
- Click "Buy" on any crypto card
- Enter amount to buy
- See total USD value calculated
- Click "Buy Now" to execute trade
- Transaction recorded automatically

### 4. View Portfolio
- Click "Portfolio" in sidebar
- See all your holdings
- View profit/loss summary
- Click trash icon to sell all holdings of a coin

### 5. View Transactions
- Click "Transactions" in sidebar
- See all buy/sell/deposit transactions
- Filter by type if needed
- View timestamp and status for each transaction

### 6. Settings
- Update preferences
- Manage security settings
- View account information
- Logout

---

## Razorpay Integration

### Setup Razorpay Account
1. Go to https://razorpay.com
2. Create an account and verify
3. Get your **Key ID** and **Key Secret** from Dashboard → Settings → API Keys
4. Add to `.env`:
   ```
   RAZORPAY_KEY_ID=rzp_test_xxx
   RAZORPAY_KEY_SECRET=your_secret_xxx
   ```

### Add to Frontend
Add your Key ID to `client/.env`:
```
VITE_RAZORPAY_KEY_ID=rzp_test_xxx
```

### Testing Razorpay Locally
- Use test mode credentials (start with `rzp_test_`)
- Test cards in Razorpay Dashboard → Settings → Test Mode
- All payments in test mode are simulated

### Production Deployment
1. Get live credentials (start with `rzp_live_`)
2. Update `.env` with live keys
3. Razorpay automatically handles webhooks

---

## Production Deployment

### Build Frontend
```bash
cd client
npm run build
```

Output in `client/dist`

### Deploy Options

#### Vercel (Recommended for Frontend)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

#### Backend Deployment (Node.js)
- DigitalOcean App Platform
- Heroku
- Railway
- AWS EC2 with PM2

#### Example: DigitalOcean App Platform
1. Push to GitHub
2. Connect repository to DigitalOcean
3. Set environment variables
4. Deploy

---

## Troubleshooting

### MongoDB Connection Error
- Verify connection string in .env
- Check MongoDB Atlas IP whitelist includes your IP
- Ensure credentials are correct

### Stripe Webhook Not Firing
- Verify webhook secret in .env
- Check Stripe dashboard for failed events
- Use `stripe listen` locally for testing

### API Calls Failing
- Check backend is running on port 5000
- Verify CORS origin matches CLIENT_URL
- Check browser console for detailed error

### Token Expiration
- Tokens are set to expire in 7 days
- Implement refresh token endpoint for long sessions
- Store token in localStorage (already implemented)

---

## Project Structure

```
Nexus-Finance/
├── server/
│   ├── src/
│   │   ├── models/        # MongoDB schemas
│   │   ├── routes/        # Express routes
│   │   ├── controllers/   # Business logic
│   │   ├── middleware/    # Auth, error handling
│   │   ├── config/        # Database config
│   │   ├── utils/         # Helper functions
│   │   └── index.js       # Server entry
│   └── package.json
├── client/
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── stores/        # Zustand stores
│   │   ├── services/      # API client
│   │   ├── App.jsx        # Root component
│   │   ├── main.jsx       # Entry point
│   │   └── index.css      # Styles
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

---

## Security Best Practices

✅ **Implemented:**
- JWT token authentication
- Password hashing with bcrypt
- Environment variable protection
- CORS configuration
- Helmet.js for security headers
- Validated user inputs

⚠️ **To Add in Production:**
- Rate limiting on API endpoints
- HTTPS enforced
- SQL/NoSQL injection prevention
- CSRF protection
- Secure cookie settings
- Request logging and monitoring

---

## Performance Optimization

#### Current Implementation:
- 5-second crypto price polling
- Caching for API responses
- Client-side state management (Zustand)
- Optimized database queries with indexes

#### Future Improvements:
- WebSocket for real-time updates (instead of polling)
- Redis caching layer
- Database connection pooling
- Image optimization
- Code splitting in React

---

## Support & Documentation

For detailed API documentation, check the individual route files in `/server/src/routes/`

Each route file contains:
- Endpoint paths
- Required parameters
- Response formats
- Error codes

---

## Next Steps

1. ✅ Backend and Frontend Complete
2. Configure all environment variables
3. Start both servers
4. Create test account and trade
5. Deploy to production
6. Monitor webhooks and transactions
7. Gather user feedback and iterate

Happy trading! 🚀

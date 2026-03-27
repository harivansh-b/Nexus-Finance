# NEXUS-FINANCE: Complete Setup Guide (Clerk + Razorpay)

## Prerequisites ✅
- Node.js 18+ installed
- npm or yarn
- MongoDB Atlas account (free tier ok)
- Clerk account (https://clerk.com)
- Razorpay account (https://razorpay.com)
- Resend account (https://resend.com)
- CoinGecko API (free, no key needed for basic)

---

## Step 1: MongoDB Setup

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account and cluster
3. Get connection string like:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/nexus-finance?retryWrites=true&w=majority
   ```
4. Replace `username` and `password` with your credentials

---

## Step 2: Clerk Authentication Setup

### Create Clerk Application
1. Go to https://clerk.com → Sign up
2. Create new application
3. Choose **Email + Password** (or add Google/GitHub OAuth)
4. Get your keys from **API Keys** section:
   - **CLERK_SECRET_KEY** (starts with `sk_live_` or `sk_test_`)
   - **CLERK_PUBLISHABLE_KEY** (starts with `pk_live_` or `pk_test_`)

### Update Backend (.env)
```
CLERK_SECRET_KEY=sk_test_xxxxx
```

### Update Frontend (.env)
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
```

### Set Webhooks
1. Go to Clerk Dashboard → Webhooks
2. Create endpoint: `http://localhost:5000/api/auth/clerk-webhook` (local) or `https://yourdomain.com/api/auth/clerk-webhook` (production)
3. Events: `user.created`, `user.deleted`
4. Copy signing secret (optional, for production validation)

---

## Step 3: Razorpay Payment Setup

### Get Razorpay Keys
1. Go to https://razorpay.com → Sign up
2. Go to **Settings** → **API Keys**
3. Get **Key ID** and **Key Secret** (test or live keys)

### Update Backend (.env)
```
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_secret_xxxxx
```

### Update Frontend (.env)
```
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx
```

---

## Step 4: Resend Email Setup

1. Go to https://resend.com → Sign up
2. Get API key from dashboard
3. Verify sender email (add to Resend)
4. Update Backend (.env):
   ```
   RESEND_API_KEY=re_xxxxx
   ```

---

## Step 5: Project Installation

### Backend Setup
```bash
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your keys (see template below)
nano .env  # or use your editor

# Test database connection
npm run dev
```

### Frontend Setup
```bash
cd ../client

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your keys
nano .env  # or use your editor

# Start dev server
npm run dev
```

---

## Complete .env Templates

### server/.env
```
# Server Config
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nexus-finance?retryWrites=true&w=majority

# JWT Secret (generate random string, min 32 chars)
JWT_SECRET=your_jwt_secret_key_here_min_32_characters_long

# Clerk Authentication
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx

# Razorpay Payment
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here

# Resend Email
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173

# Optional: CoinGecko API Key (free tier works fine)
COINGECKO_API_KEY=

# Email Configuration
ADMIN_EMAIL=admin@nexus-finance.com
SUPPORT_EMAIL=support@nexus-finance.com

# Features
ENABLE_ADVANCED_ORDERS=false
CRYPTO_UPDATE_INTERVAL=5000
```

### client/.env
```
# API Configuration
VITE_API_URL=http://localhost:5000
VITE_ENV=development

# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx

# Razorpay
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx

# App Configuration
VITE_APP_NAME=Nexus-Finance
VITE_CRYPTO_UPDATE_INTERVAL=5000
```

---

## Running the Application

### Terminal 1: Backend
```bash
cd server
npm run dev
```
Expected output:
```
✅ Server running on http://localhost:5000
📊 Environment: development
```

### Terminal 2: Frontend
```bash
cd client
npm run dev
```
Expected output:
```
VITE v4.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### Terminal 3: Access Application
Open browser to `http://localhost:5173`

---

## Testing Workflow

### 1. Register New Account
- Click "Sign Up" → Enter email, password, username
- Choose authentication method (Custom Email or Clerk)
- Should create user in MongoDB

### 2. Login
- Click "Login" → Enter credentials
- Should receive JWT token
- Redirected to Dashboard

### 3. View Cryptocurrencies
- Dashboard shows top 50 cryptocurrencies
- Prices update from CoinGecko API (5-second intervals)
- Search bar filters cryptocurrencies in real-time

### 4. Add Funds (Razorpay)
- Go to Settings → Billing Tab
- Click "Add Funds"
- Enter amount (minimum ₹1)
- Click "Pay with Razorpay"
- Razorpay checkout opens
- **Test card**: Use any test card from Razorpay Dashboard
- Payment processes and balance updates

### 5. Buy Cryptocurrency
- Click "Buy" on any crypto card
- Enter amount to buy
- System validates balance
- Click "Buy Now"
- Transaction recorded and portfolio updated

### 6. View Portfolio
- Click "Portfolio" in sidebar
- See all holdings with profit/loss
- Click trash icon to sell holdings
- Sale updates balance

### 7. View Transactions
- Click "Transactions" in sidebar
- See all BUY/SELL/DEPOSIT transactions
- Filter by type if needed
- View transaction details

### 8. Logout
- Settings → Bottom → "Logout" button
- Redirects to landing page

---

## Authentication Flow

### Custom Email + Password
1. User registers with email/password
2. Password hashed with bcryptjs
3. JWT token generated (7-day expiration)
4. User stored in MongoDB
5. Token stored in localStorage

### Clerk Authentication
1. User clicks "Sign Up with Clerk"
2. Clerk handles registration/login
3. Webhook sends user data to backend
4. Backend creates user record (if new)
5. User automatically logged in

Both methods work together - unified user system.

---

## API Testing

### Test Backend Health
```bash
curl http://localhost:5000/api/health
```

### Test Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "username": "testuser"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Crypto List
```bash
curl http://localhost:5000/api/crypto/list?limit=10
```

### Test Buy Crypto (with token)
```bash
curl -X POST http://localhost:5000/api/trade/buy \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "coingeckoId": "bitcoin",
    "amount": 0.5,
    "coinName": "Bitcoin",
    "coinSymbol": "BTC"
  }'
```

---

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Check MONGODB_URI in .env, whitelist your IP in MongoDB Atlas

### Clerk Keys Invalid
```
Error: Invalid API key provided
```
**Solution**: Regenerate keys from Clerk Dashboard, ensure correct format (pk_test_/sk_test_)

### Razorpay Payment Fails
```
Error: Invalid order ID
```
**Solution**: Ensure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are correct in .env

### Port Already in Use
```
Error: listen EADDRINUSE :::5000
```
**Solution**: Change PORT in .env or kill process using port: `lsof -ti:5000 | xargs kill -9`

### CORS Errors
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution**: Ensure VITE_API_URL matches CLIENT_URL in server .env

---

## Production Deployment

### Build Frontend
```bash
cd client
npm run build
```

### Deploy Frontend
- **Vercel**: `vercel deploy`
- **Netlify**: Drag & drop `dist/` folder
- **AWS S3**: Upload `dist/` to S3 bucket

### Deploy Backend
- **Railway**: Connect GitHub repo, set env vars, deploy
- **Render**: Create new web service, connect GitHub
- **DigitalOcean**: App Platform or Droplet with PM2

### Update Environment Variables for Production
- Change `NODE_ENV=production`
- Use live Clerk keys (pk_live_, sk_live_)
- Use live Razorpay keys (rzp_live_)
- Update `CLIENT_URL` to production domain
- Update Clerk webhook URL to production

---

## Next Steps

1. ✅ Set up all accounts (MongoDB, Clerk, Razorpay, Resend)
2. ✅ Configure environment variables
3. ✅ Run both servers
4. ✅ Test complete workflow
5. ✅ Deploy to production

---

## Support

Check individual service documentation:
- **Clerk**: https://clerk.com/docs
- **Razorpay**: https://razorpay.com/docs
- **MongoDB**: https://docs.mongodb.com
- **CoinGecko**: https://www.coingecko.com/api/documentations/v3

Happy trading! 🚀

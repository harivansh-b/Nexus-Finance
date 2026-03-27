# Setup Checklist & Testing Guide

## ✅ Project Initialization

Your Nexus-Finance platform is now fully scaffolded! Here's what's been created:

### Backend (46 files)
- ✅ Express server with middleware
- ✅ MongoDB model schemas (User, Portfolio, Transaction, Order, Watchlist)
- ✅ Authentication system (JWT + Clerk ready)
- ✅ CoinGecko API integration with caching
- ✅ Trading system (Buy/Sell with balance validation)
- ✅ Stripe payment integration
- ✅ Resend email service
- ✅ Error handling middleware
- ✅ API routes organized by feature

### Frontend (26 files)
- ✅ React + Vite + Tailwind CSS setup
- ✅ Zustand state management (authStore, tradeStore)
- ✅ Responsive dark theme UI
- ✅ Auth system (Register, Login, Protected Routes)
- ✅ Dashboard with crypto search & filtering
- ✅ Portfolio management
- ✅ Transaction history
- ✅ Settings page
- ✅ Buy/Sell modals
- ✅ API client with interceptors

---

## 🚀 Getting Started

### Step 1: Create .env Files

**Server (`server/.env`):**
```bash
cp server/.env.example server/.env

# Edit and add your credentials:
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nexus-finance
JWT_SECRET=your_secret_key_here_min_32_characters_long
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
RESEND_API_KEY=re_your_api_key_here
CLIENT_URL=http://localhost:5173
```

**Client (`client/.env`):**
```bash
cp client/.env.example client/.env

# Should contain:
VITE_API_URL=http://localhost:5000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

### Step 2: Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend (in new terminal)
cd client
npm install
```

### Step 3: Start Servers

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

You should see:
- Backend: ✅ Server running on http://localhost:5000
- Frontend: ✅ Development server ready at http://localhost:5173

---

## 🧪 Testing Flow

### Phase 1: User Registration & Authentication
1. Open http://localhost:5173
2. Click "Sign Up"
3. Fill in: Username, Email, Password (min 6 chars)
4. Click "Create Account"
5. ✅ Should redirect to Dashboard

### Phase 2: Dashboard & Crypto Discovery
1. You're now on the Dashboard
2. See top 50 cryptocurrencies loading
3. Each card shows:
   - Crypto name, symbol, logo
   - Current USD price
   - 24h % change (green=up, red=down)
   - Buy / Sell buttons
4. Try searching: Type "Bitcoin" in search box
5. ✅ Should filter results in real-time

### Phase 3: Buy Cryptocurrency
1. Click "Buy" on any crypto (e.g., Bitcoin)
2. Enter amount (e.g., 0.5 BTC)
3. See USD value calculated: 0.5 × current price
4. Check your balance is sufficient (starts at $10,000)
5. Click "Buy Now"
6. ✅ Should see success toast
7. ✅ Transaction appears in Transactions page
8. ✅ Balance deducted in sidebar

### Phase 4: View Portfolio
1. Click "Portfolio" in sidebar
2. See all holdings displayed in table:
   - Coin name & symbol
   - Amount held
   - Average buy price
   - Total invested
3. See portfolio summary at top:
   - Total invested
   - Total current value
   - Profit/Loss ($)
   - Profit/Loss (%)
   - Cash balance
4. ✅ Math checks out: (amount × current_price) = current_value

### Phase 5: Transaction History
1. Click "Transactions" in sidebar
2. See all buy/sell/deposit transactions
3. Check columns: Type, Coin, Amount, Price, Total, Date, Status
4. ✅ All values match your purchases

### Phase 6: Sell Cryptocurrency
1. Go to Portfolio
2. Click trash icon on any holding
3. ✅ Crypto removed from portfolio (or amount reduced if partial)
4. ✅ Proceeds added back to balance
5. ✅ New SELL transaction recorded

### Phase 7: Settings & Logout
1. Click "Settings" in sidebar
2. View your account info
3. Check different tabs: General, Notifications, Security, Billing
4. Click "Logout" button
5. ✅ Should redirect to login page
6. ✅ Token cleared from localStorage

### Phase 8: Login Again
1. Click "Login"
2. Enter credentials from registration
3. Click "Login"
4. ✅ Should return to Dashboard with same portfolio intact

---

## 📊 API Testing (Optional with Postman/Bruno)

### Test Register
```
POST http://localhost:5000/api/auth/register
Body (JSON):
{
  "email": "test@example.com",
  "password": "password123",
  "username": "testuser"
}
```

### Test Login
```
POST http://localhost:5000/api/auth/login
Body (JSON):
{
  "email": "test@example.com",
  "password": "password123"
}
Response: { token, user }
```

### Test Crypto List
```
GET http://localhost:5000/api/crypto/list?limit=50
```

### Test Buy (with token)
```
POST http://localhost:5000/api/trade/buy
Headers: Authorization: Bearer {token}
Body (JSON):
{
  "coingeckoId": "bitcoin",
  "amount": 0.5,
  "coinName": "Bitcoin",
  "coinSymbol": "BTC"
}
```

### Test Portfolio Summary (with token)
```
GET http://localhost:5000/api/trade/portfolio/summary
Headers: Authorization: Bearer {token}
```

---

## 🔧 Troubleshooting

### Frontend won't connect to backend
- ✅ Verify backend is running on port 5000
- ✅ Check CORS origin in `server/src/index.js` matches frontend URL
- ✅ Look for CORS errors in browser console

### MongoDB connection fails
- ✅ Verify `MONGODB_URI` is correct in `.env`
- ✅ Check MongoDB Atlas IP whitelist includes your IP
- ✅ Test connection string in MongoDB Atlas UI

### Crypto data not loading
- ✅ CoinGecko API is working (check 5s cache refresh)
- ✅ No API key needed for free tier
- ✅ Check browser network tab for API responses

### Buy button doesn't work
- ✅ Check sufficient balance ($10,000 starting)
- ✅ Watch console for error messages
- ✅ Verify JWT token is in localStorage

---

## 📝 Environment Setup Summary

| Service | What's Needed | Where to Get |
|---------|---------------|-------------|
| MongoDB | `MONGODB_URI` | mongodb.com/atlas |
| Stripe | `STRIPE_SECRET_KEY` | stripe.com/dashboard |
| Resend | `RESEND_API_KEY` | resend.com/api-keys |
| CoinGecko | (Free, no key needed) | Data auto-fetched |
| Clerk | (Optional for advanced auth) | clerk.com |

---

## 🎯 Next Steps (After Testing)

1. **Deploy Backend**: Heroku, Railway, DigitalOcean
2. **Deploy Frontend**: Vercel, Netlify
3. **Setup Stripe Webhooks**: For real payment processing
4. **Enable Clerk Auth**: Replace custom JWT if preferred
5. **Add Rate Limiting**: Protect API endpoints
6. **Monitor Performance**: Add analytics/logging
7. **User Feedback**: Iterate based on testing

---

## 📚 Key Commands

```bash
# Backend
npm run dev        # Start development server
npm run start      # Production start
npm run build      # Build (currently just echoes)

# Frontend
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build

# Git
git status         # Check status
git log --oneline  # View commits
git diff          # View changes
```

---

## ✨ Feature Checklist

- [x] User authentication (register/login)
- [x] Crypto data from CoinGecko (live prices)
- [x] Buy/Sell cryptocurrencies
- [x] Portfolio tracking
- [x] Transaction history
- [x] Watchlist management
- [x] Stripe integration (ready to test)
- [x] Email notifications (via Resend)
- [x] Dark theme UI
- [x] Responsive design
- [ ] Advanced orders (Limit/Stop-Loss) - Future
- [ ] Price alerts - Future
- [ ] WebSocket real-time - Future

---

## 🎓 Learning Resources

- **Backend**: Check `server/src/controllers/` for business logic
- **Frontend**: Check `client/src/components/` for UI patterns
- **State**: Check `client/src/stores/` for Zustand patterns
- **API**: Check `client/src/services/api.js` for fetch patterns

---

**Your Nexus-Finance platform is ready to test!** 🚀

Start with the testing flow above, and let me know if you hit any issues.

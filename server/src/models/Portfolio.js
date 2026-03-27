import mongoose from 'mongoose';

const portfolioSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    coin: {
      name: { type: String, required: true }, // e.g., "Bitcoin"
      symbol: { type: String, required: true, uppercase: true }, // e.g., "BTC"
      coingeckoId: { type: String, required: true }, // e.g., "bitcoin"
      logo: String,
    },
    amount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    avgBuyPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    totalInvested: {
      type: Number,
      required: true,
      default: 0,
    },
    lastBuyPrice: Number,
    lastBuyAt: Date,
  },
  { timestamps: true }
);

// Compound index to ensure unique portfolio entries per user and coin
portfolioSchema.index({ userId: 1, 'coin.symbol': 1 }, { unique: true });

export default mongoose.model('Portfolio', portfolioSchema);

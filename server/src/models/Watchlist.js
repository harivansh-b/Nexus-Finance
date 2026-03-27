import mongoose from 'mongoose';

const watchlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    coins: [
      {
        name: String,
        symbol: { type: String, uppercase: true },
        coingeckoId: { type: String, required: true },
        logo: String,
        addedAt: { type: Date, default: Date.now },
      }
    ],
  },
  { timestamps: true }
);

watchlistSchema.index({ userId: 1, 'coins.coingeckoId': 1 }, { sparse: true });

export default mongoose.model('Watchlist', watchlistSchema);

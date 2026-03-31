import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['BUY', 'SELL', 'DEPOSIT', 'WITHDRAWAL'],
      required: true,
    },
    coin: {
      name: String,
      symbol: { type: String, uppercase: true },
      coingeckoId: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    totalValue: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED'],
      default: 'PENDING',
    },
    fee: {
      type: Number,
      default: 0,
    },
    balanceBefore: Number,
    balanceAfter: Number,
    description: String,
    notes: String,
    relatedId: mongoose.Schema.Types.ObjectId, // For linking deposits to Razorpay payments
  },
  { timestamps: true }
);

transactionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Transaction', transactionSchema);

import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    coin: {
      name: String,
      symbol: { type: String, uppercase: true },
      coingeckoId: String,
    },
    type: {
      type: String,
      enum: ['LIMIT', 'STOP_LOSS', 'TAKE_PROFIT'],
      required: true,
    },
    orderSide: {
      type: String,
      enum: ['BUY', 'SELL'],
      required: true,
    },
    targetPrice: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['OPEN', 'PARTIALLY_FILLED', 'FILLED', 'CANCELLED'],
      default: 'OPEN',
    },
    filledAmount: {
      type: Number,
      default: 0,
    },
    triggerPrice: Number,
    createdPrice: Number,
    expiresAt: Date,
    notes: String,
  },
  { timestamps: true }
);

orderSchema.index({ userId: 1, status: 1 });

export default mongoose.model('Order', orderSchema);

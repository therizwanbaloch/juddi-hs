import mongoose, { Schema, Document, Types } from 'mongoose';

export type PaymentStatus = 'Completed' | 'Pending' | 'Refunded';

export interface IPayment extends Document {
  orderId: Types.ObjectId;
  amount: number;
  paymentDate: Date;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  referenceNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order reference is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [1, 'Payment amount must be positive'],
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      trim: true,
    },
    paymentStatus: {
      type: String,
      enum: ['Completed', 'Pending', 'Refunded'],
      default: 'Completed',
    },
    referenceNumber: {
      type: String,
      required: [true, 'Reference number is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

PaymentSchema.index({ orderId: 1, paymentStatus: 1 });

export const PaymentModel =
  mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);

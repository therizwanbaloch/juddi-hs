import mongoose, { Schema, Document, Types } from 'mongoose';

export type OrderStatus =
  | 'New'
  | 'Contacted'
  | 'Pending'
  | 'Confirmed'
  | 'Rejected'
  | 'Cancelled';

export interface IOrder extends Document {
  orderId: string;
  customerName: string;
  phone: string;
  email: string;
  plotId: Types.ObjectId;
  message: string;
  status: OrderStatus;
  internalNotes: string;
  confirmedSalePrice?: number;
  confirmedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    customerName: {
      type: String,
      required: [true, 'Customer full name is required'],
      trim: true,
      maxlength: 120,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      maxlength: 40,
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
    },
    plotId: {
      type: Schema.Types.ObjectId,
      ref: 'Plot',
      required: [true, 'Plot reference is required'],
    },
    message: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Pending', 'Confirmed', 'Rejected', 'Cancelled'],
      default: 'New',
    },
    internalNotes: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    confirmedSalePrice: {
      type: Number,
      min: 0,
    },
    confirmedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

OrderSchema.index({ plotId: 1, status: 1 });
OrderSchema.index({ createdAt: -1 });

export const OrderModel =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

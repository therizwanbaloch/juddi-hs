import mongoose, { Schema, Document } from 'mongoose';

export interface IPlotImage {
  url: string;
  publicId: string;
}

export type PlotCategory = 'Residential' | 'Commercial' | 'Mixed Use';
export type PlotStatus = 'Available' | 'Reserved' | 'Sold';

export interface IPlot extends Document {
  title: string;
  plotNumber: string;
  lengthFt: number;
  widthFt: number;
  areaSqFt: number;
  size: string;
  block: string;
  category: PlotCategory;
  price: number;
  pricePerSqFt: number;
  description: string;
  features: string[];
  dimensions?: string;
  facing?: string;
  images: IPlotImage[];
  status: PlotStatus;
  createdAt: Date;
  updatedAt: Date;
}

const PlotImageSchema = new Schema<IPlotImage>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false }
);

const PlotSchema = new Schema<IPlot>(
  {
    title: {
      type: String,
      required: [true, 'Plot title is required'],
      trim: true,
      maxlength: 160,
    },
    plotNumber: {
      type: String,
      required: [true, 'Plot number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    lengthFt: {
      type: Number,
      required: [true, 'Plot length in feet is required'],
      min: [1, 'Length must be greater than 0'],
    },
    widthFt: {
      type: Number,
      required: [true, 'Plot width in feet is required'],
      min: [1, 'Width must be greater than 0'],
    },
    areaSqFt: {
      type: Number,
      required: [true, 'Total area in sq ft is required'],
      min: [1, 'Area must be greater than 0'],
    },
    size: {
      type: String,
      required: [true, 'Plot area display is required'],
      trim: true,
    },
    block: {
      type: String,
      required: [true, 'Block name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Residential', 'Commercial', 'Mixed Use'],
      required: [true, 'Category is required'],
    },
    price: {
      type: Number,
      required: [true, 'Plot price is required'],
      min: [1, 'Price must be positive'],
    },
    pricePerSqFt: {
      type: Number,
      required: true,
      min: [0, 'Price per sq ft cannot be negative'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 3000,
    },
    features: {
      type: [String],
      default: [],
    },
    dimensions: {
      type: String,
      trim: true,
      default: '',
    },
    facing: {
      type: String,
      trim: true,
      default: '',
    },
    images: {
      type: [PlotImageSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ['Available', 'Reserved', 'Sold'],
      default: 'Available',
    },
  },
  {
    timestamps: true,
  }
);

PlotSchema.index({ category: 1, block: 1, status: 1 });
PlotSchema.index({ price: 1 });
PlotSchema.index({ areaSqFt: 1 });

export const PlotModel =
  mongoose.models.Plot || mongoose.model<IPlot>('Plot', PlotSchema);

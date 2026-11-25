export type PlotCategory = 'Residential' | 'Commercial' | 'Mixed Use';
export type PlotStatus = 'Available' | 'Reserved' | 'Sold';
export type OrderStatus =
  | 'New'
  | 'Contacted'
  | 'Pending'
  | 'Confirmed'
  | 'Rejected'
  | 'Cancelled';

export interface PlotImage {
  url: string;
  publicId: string;
}

export interface Plot {
  _id: string;
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
  images: PlotImage[];
  status: PlotStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  _id: string;
  orderId: string;
  customerName: string;
  phone: string;
  email: string;
  plotId: string;
  message: string;
  status: OrderStatus;
  internalNotes: string;
  confirmedSalePrice?: number;
  confirmedAt?: string;
  createdAt: string;
  updatedAt: string;
  plot?: {
    _id: string;
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
    status: PlotStatus;
    images: PlotImage[];
  } | null;
}

export interface PaymentRecord {
  _id: string;
  orderId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  paymentStatus: 'Completed' | 'Pending' | 'Refunded';
  referenceNumber: string;
  createdAt: string;
  order?: {
    _id: string;
    orderId: string;
    customerName: string;
    confirmedSalePrice?: number;
  } | null;
}

export interface DashboardAnalytics {
  summary: {
    totalPlots: number;
    availablePlots: number;
    reservedPlots: number;
    soldPlots: number;
    totalBookingOrders: number;
    pendingOrders: number;
    confirmedSalesCount: number;
    confirmedSalesValue: number;
    collectedPaymentsTotal: number;
  };
  periods: {
    today: { count: number; value: number };
    weekly: { count: number; value: number };
    monthly: { count: number; value: number };
    yearly: { count: number; value: number };
  };
  charts: {
    dailySeries: { label: string; salesCount: number; salesValue: number }[];
    weeklySeries: { label: string; salesCount: number; salesValue: number }[];
    monthlySeries: {
      label: string;
      salesCount: number;
      salesValue: number;
      collectedAmount: number;
    }[];
    yearlySeries: { label: string; salesCount: number; salesValue: number }[];
    plotAvailabilityByCategory: {
      category: PlotCategory;
      Available: number;
      Reserved: number;
      Sold: number;
    }[];
  };
  salesHistory: Order[];
  recentOrders: Order[];
  payments: PaymentRecord[];
  system: {
    databaseMode: string;
    mediaMode: string;
  };
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
}

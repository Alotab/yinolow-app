// src/models/Order.ts
import mongoose, { Schema, Document, Types } from "mongoose";
import { ORDER_STATUSES, OrderStatus } from "../constants/orderStatus";


export interface IOrderItem {
  productId: string;
  quantity: number;
  price: number;
}


export interface IOrder extends Document {
  _id: Types.ObjectId;
  orderNumber: string;
  userId: string;
  items: IOrderItem[];
  total: number;
  status: OrderStatus;
  userEmail?: string;
  paymentIntentId?: string;
  paymentResult?: Record<string, any>;
  trackingCode?: string;
  shipping?: any;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    items: [
      {
        productId: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    total: { type: Number, required: true },
    userEmail: { type: String },
    status: { type: String, enum: ORDER_STATUSES, default: "processing" },  paymentIntentId: { type: String },
    paymentResult: { type: Schema.Types.Mixed },
    trackingCode: { type: String, unique: true, sparse: true },
    shipping: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>("Order", OrderSchema);
export default Order;

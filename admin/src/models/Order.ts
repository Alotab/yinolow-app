import mongoose, { Document, Schema } from "mongoose";


export interface IOrderItem {
    productId: string;
    quantity: number;
    price: number;
}

export interface IOrder extends Document {
    userId: string;
    items: IOrderItem[];
    total: number;
    status: "pending" | "paid" | "failed";
    createdAt: Date;
    updatedAt: Date;
}


const orderSchema = new Schema<IOrder>({
    userId: { type: String, required: true },
    items: [
        {
            productId: { type: String, required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true }
        },
    ],
    total: { type: Number, required: true },
    status: { type: String, enum: ["pending", "paid", "failed"], default: "pending", }
}, 
    { timestamps: true}
);


export const Order = mongoose.model<IOrder>("Order", orderSchema)
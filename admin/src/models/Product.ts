import mongoose, { Schema, model, Document, Types } from "mongoose";



export interface IProduct extends Document {
    seller?: String;
    name: String;
    description?: string;
    price: number;
    sku?: string;
    images?: string[];
    stock?: number;
    category?: String;
    colors?: String[];
    sizes?: String[];
    tags?: string[];
    createdAt?: Date;
    updatedAt?: Date
}

const ProductSchema = new Schema<IProduct>({
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
    },
    price: {
        type: Number,
        required: true
    },
    sku: {
        type: String,
        requred: true,
        unique: true,
        index: true
    },
    stock: {
        type: Number,
        default: 0
    },
    category: {
        type: String
    },
    colors: [{ type: String }],
    sizes: [{ type:  String }],
    tags: [{ type: String }],
    images: [{ type: String , required: true}]
}, { timestamps: true});


ProductSchema.index({ name: "text" })

export const Product = model<IProduct>("Product", ProductSchema);
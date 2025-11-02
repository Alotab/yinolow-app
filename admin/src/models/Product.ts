import mongoose, { Schema, model, Document, Types } from "mongoose";



export interface IProduct extends Document {
    seller?: String;
    name: string;
    description?: string;
    price: number;
    currency?: string;
    sku?: string;
    slug: string;
    images?: string[];
    stock?: number;
    brand?: string;
    category?: String;
    colors?: string[];
    sizes?: string[];
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
    slug: { 
        type: String, required: true, unique: true, lowercase: true 
    },
    description: {
        type: String,
    },
    price: {
        type: Number,
        required: true
    },
    currency: { 
        type: String, default: "GHS" 
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
    brand: { 
        type: String
    },
    category: {
        type: String
    },
    colors: [{ type: String }],
    sizes: [{ type:  String }],
    tags: [{ type: String }],
    images: [{ type: String , required: true}]
}, { timestamps: true});


ProductSchema.index({ name: "text", description: "text" });

export const Product = model<IProduct>("Product", ProductSchema);
export default Product;
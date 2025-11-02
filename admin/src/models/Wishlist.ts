// src/models/Wishlist.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IWishlist extends Document {
  userId: string;
  items: {
    productId: mongoose.Types.ObjectId;
    addedAt: Date;
  }[];
}

const wishlistSchema = new Schema<IWishlist>(
  {
    userId: { type: String, required: true, unique: true },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        addedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const Wishlist = mongoose.model<IWishlist>("Wishlist", wishlistSchema);

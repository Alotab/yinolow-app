import { Schema, model, Document } from "mongoose";
const bcrypt = require("bcryptjs")
// import { } from "bcryptjs"



export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: "user" | "admin";
    createdAt: Date;
    comparePassword(candidate: string): Promise<boolean>;
}


const UserSchema = new Schema<IUser>({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    
}, { timestamps: true });



UserSchema.methods.comparePassword = async function(candidate: string) {
    try {
        return bcrypt.compare(candidate, this.password)
    } catch (err){
        throw err
    }
};

// Indexings
UserSchema.index({name : 'text'});

export const User = model<IUser>("User", UserSchema);
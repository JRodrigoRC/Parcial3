import mongoose, { Schema, model } from "mongoose";

export interface UserDocument {
  _id: string;
  email: string;
  password: string;
  name: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: [true, "El email es necesario"],
      unique: true,
      match: [
        /^\w+([.-]?\w+)@\w+([.-]?\w+)(.\w{2,3})+$/,
        "El email no tiene un formato válido",
      ]
    },
    password: {
      type: String,
      required: false,
      select: false,
    },
    name: {
      type: String,
      required: [true, "El nombre es necesario"],
    },
    image: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true, versionKey: false
  }
);

const User = mongoose.models?.User || model<UserDocument>("User", userSchema);
export default User;
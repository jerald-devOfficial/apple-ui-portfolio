import mongoose, { Model, model, Schema } from 'mongoose';

export interface IAdmin extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  authType: string;
  googleId: string;
}

const adminSchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    authType: {
      type: String,
      required: true,
    },
    googleId: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Admin = (mongoose.models.Admin ||
  model('Admin', adminSchema)) as Model<IAdmin>;

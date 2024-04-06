import mongoose, { Model, model, Schema } from "mongoose";

export interface IContact extends Document {
  _id: string,
    fullName: string;
    avatarColor: string;
    email: string;
    subject: string;
    message: string;
    read: boolean;
    createdAt: Date;
    updatedAt: Date;
  }

const contactSchema = new Schema({
  fullName: {
    type: String,
    required: [true, "Name is required."],
    trim: true,
    minLength: [2, "Name must be larger than 2 characters"],
    maxLength: [50, "Name must be lesser than 50 characters"],
  },

  avatarColor: {
    type: String
  },

  subject: {
    type: String,
    required: [true, "Subject is required."],
    trim: true,
    minLength: [2, "Subject must be larger than 2 characters"],
    maxLength: [100, "Subject must be lesser than 100 characters"],
  },

  read: {
    type: Boolean,
    default: false
  },

  email: {
    type: String,
    required: [true, "Email is required."],
    match: [/^[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}$/i, "Invalid email address"],
  },

  message: {
    type: String,
    required: [true, "Message is required."],
  },

  date: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true }
);

export const Contact = (mongoose.models.Contact ||
    model('Contact', contactSchema)) as Model<IContact>;
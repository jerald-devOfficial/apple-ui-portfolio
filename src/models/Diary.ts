import mongoose, { Model, model } from 'mongoose';

export interface IDiary extends Document {
    _id: string,
     title: string;
     content: string;
      createdAt: Date;
      updatedAt: Date;
    }

const diarySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  }  },{ timestamps: true }
);


export const Diary = (mongoose.models.Diary ||
    model('Diary', diarySchema)) as Model<IDiary>;
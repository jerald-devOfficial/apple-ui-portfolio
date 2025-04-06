// reference: https://github.com/kunalagra/codegamy/blob/main/utils/dbConnect.js

import { initModels } from '@/lib/models'
import mongoose from 'mongoose'

const uri = process.env.MONGODB_URI!

// Create a function to connect to the database
const dbConnect = async () => {
  if (mongoose.connection.readyState >= 1) {
    // If already connected, return the existing connection
    initModels() // Ensure models are registered even if connection exists
    return mongoose.connection
  }

  try {
    // Connect to the MongoDB database using Mongoose
    await mongoose.connect(uri)
    console.log('Connected to MongoDB with Mongoose')

    // Initialize models
    const models = initModels()
    console.log('Models initialized:', models)
  } catch (error) {
    console.error('Error connecting to MongoDB with Mongoose:', error)
    throw error
  }
}

export default dbConnect

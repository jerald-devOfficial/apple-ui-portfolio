import mongoose from 'mongoose'

const connect = async () => {
  try {
    // Show connection URI (with credentials masked)
    const uri = process.env.MONGODB!
    const maskedUri = uri.replace(/:([^@]+)@/, ':****@')
    console.log(`Connecting to MongoDB: ${maskedUri}`)

    await mongoose.connect(process.env.MONGODB!)
    console.log('MongoDB connected successfully')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw new Error('Connection to MongoDB failed!')
  }
}

export default connect

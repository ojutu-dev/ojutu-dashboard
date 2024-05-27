import mongoose from 'mongoose';

const connectToMongoDB = async (mongoURI) => {
    try {
        await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        throw error;
    }
}

export default connectToMongoDB;
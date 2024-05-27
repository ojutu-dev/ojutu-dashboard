import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const keywordsSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
}, { timestamps: true });

const Keywords = mongoose.models.Keywords || model('Keywords', keywordsSchema);

export default Keywords;

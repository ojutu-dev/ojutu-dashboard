import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const authorSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    unique: true,
    required: true,
  },
  image: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
}, { timestamps: true });

const Author = mongoose.models.Author || model('Author', authorSchema);

export default Author;

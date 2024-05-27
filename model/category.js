import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const categorySchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
}, { timestamps: true });

const Category = mongoose.models.Category || model('Category', categorySchema);

export default Category;

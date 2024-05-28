import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const brandSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
}, { timestamps: true });

const Brand = mongoose.models.Brand || model('Brand', brandSchema);

export default Brand;

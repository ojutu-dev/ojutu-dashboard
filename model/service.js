import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const serviceSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
}, { timestamps: true });

const Service = mongoose.models.Service || model('Service', serviceSchema);

export default Service;

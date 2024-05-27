import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const testimonySchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  work: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: "",
  },
  star: {
    type: Number,
    min: 1,
    max: 5,
    default: 1,
  },
  content: {
    type: String,
    default: "",
  },
}, { timestamps: true });

const Testimony = mongoose.models.Testimony || model('Testimony', testimonySchema);

export default Testimony;
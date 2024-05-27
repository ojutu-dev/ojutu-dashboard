import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const postSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  slug: {
        type: String,
        required: true,
        unique: true,
      },
  featuredImage: {
    type: String,
    default: "",
  },
  headerImage: {
    type: String,
    default: "",
  },
  ogImage: {
    type: String,
    default: "",
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'Author',
    default: "",
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    default: "",
  },
  body: {
    type: Array,
    
    default: {},
  },

  date: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

const Post = mongoose.models.Post || model('Post', postSchema);

export default Post;


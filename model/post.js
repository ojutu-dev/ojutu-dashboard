import mongoose from 'mongoose';
import { BlockContent } from './blockContent';

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


// import { Schema } from 'mongoose';
// import { BlockContent } from './blockContent';

// const postSchema = new Schema({
//   title: {
//     type: String,
//     required: true,
//   },
//   slug: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   description: {
//     type: String,
//     default: '',
//   },
//   author: {
//     type: Schema.Types.ObjectId,
//     ref: 'Author',
//     required: true,
//   },
//   category: {
//     type: Schema.Types.ObjectId,
//     ref: 'Category',
//     required: true,
//   },
//   content: {
//     type: BlockContent.schema,
//     required: true,
//   },
//   featuredImage: {
//     type: String,
//     default: '',
//   },
//   headerImage: {
//         type: String,
//         default: "",
//       },
//       ogImage: {
//         type: String,
//         default: "",
//       },
// }, { timestamps: true });

// const Post = mongoose.models.Post || mongoose.model('Post', postSchema);

// export default Post;

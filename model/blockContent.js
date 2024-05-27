import mongoose from 'mongoose';

const { Schema } = mongoose;

const blockSchema = new Schema({
  _type: {
    type: String,
    required: true,
    enum: ['block', 'image'],
  },
  
  // For text blocks
  children: [
    {
      _type: { type: String, enum: ['span'], default: 'span' },
      text: { type: String, required: true },
      marks: [{ type: String }],
    },
  ],
  style: {
    type: String,
    enum: ['normal', 'h1', 'h2', 'h3', 'h4', 'blockquote'],
    default: 'normal',
  },
  // For lists
  listItem: { type: String, enum: ['bullet'] },
  
  // For images
  asset: {
    _type: { type: String, enum: ['reference'], default: 'reference' },
    ref: { type: mongoose.Types.ObjectId, ref: 'ImageAsset' },
  },
  alt: String,
});

const BlockContentSchema = new Schema({
  blocks: [blockSchema],
});

export const BlockContent = mongoose.models.BlockContent || mongoose.model('BlockContent', BlockContentSchema);

export const ImageAsset = mongoose.models.ImageAsset || mongoose.model('ImageAsset', new Schema({
  url: { type: String, required: true },
  alt: { type: String },
}));

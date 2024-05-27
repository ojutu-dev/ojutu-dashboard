import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const portfolioSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  slug: {
        type: String,
        required: true,
        unique: true,
      },
      
      category: {
        type: Schema.Types.ObjectId,
        ref: 'Service',
        default: "",
      },
      address: {
        type: String,
        required: true,
      },
      brand: {
        type: Schema.Types.ObjectId,
        ref: 'Brand',
        default: "",
      },
  logo: {
    type: String,
    default: "",
  },
  mainImage: {
    type: String,
    default: "",
  },
  headerImage: {
    type: String,
    default: "",
  },
  otherImage: {
    type: String,
    default: "",
  },
  ogImage: {
    type: String,
    default: "",
  },
  ogdescription: {
    type: String,
    required: true,
  },
  keywords: {
    type: Schema.Types.ObjectId,
    ref: 'Keywords',
    default: "",
  },
 
  body: {
    type: Array,
    
    default: {},
  },

  
}, { timestamps: true });

const Portfolio = mongoose.models.Portfolio || model('Portfolio', portfolioSchema);

export default Portfolio;


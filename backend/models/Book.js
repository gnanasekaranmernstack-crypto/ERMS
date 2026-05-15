import mongoose from 'mongoose';

const bookSchema = mongoose.Schema({
  subjectName: {
    type: String,
    required: true,
  },
  subjectCode: {
    type: String,
    required: true,
  },
  authors: {
    type: String,
    required: true,
  },
  regulation: {
    type: String,
    required: true,
  },
  publication: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  description: {
    type: String,
  },
  semester: {
    type: Number,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  link: {
    type: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, {
  timestamps: true
});

const Book = mongoose.model('Book', bookSchema);

export default Book;

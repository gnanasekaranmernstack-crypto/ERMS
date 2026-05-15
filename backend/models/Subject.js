import mongoose from 'mongoose';

const subjectSchema = mongoose.Schema(
  {
    subjectName: {
      type: String,
      required: true,
    },
    subjectCode: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['Theory', 'Laboratory'],
      required: true,
    },
    semester: {
      type: Number,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const Subject = mongoose.model('Subject', subjectSchema);

export default Subject;

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      default: 'admin',
    },
    entryType: {
      type: String,
      enum: ['First Year', 'Direct Second Year'],
      default: 'First Year',
    },
    degreeBranch: String,
    university: String,
    regulation: String,
    department: String,
    startYear: String,
    endYear: String,
    collegeName: String,
    collegeAddress: String,
    collegeCode: String,
    registerNumber: String,
    mobileNumber: String,
    address: String,
  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

export default User;

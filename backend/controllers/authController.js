import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import Subject from '../models/Subject.js';
import Exam from '../models/Exam.js';
import Result from '../models/Result.js';

// @desc    Auth user & get token
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email.toLowerCase().trim();
  
  console.log(`Login attempt for: ${normalizedEmail}`);
  const user = await User.findOne({ email: normalizedEmail });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      entryType: user.entryType,
      degreeBranch: user.degreeBranch,
      university: user.university,
      regulation: user.regulation,
      department: user.department,
      startYear: user.startYear,
      endYear: user.endYear,
      collegeName: user.collegeName,
      collegeAddress: user.collegeAddress,
      collegeCode: user.collegeCode,
      registerNumber: user.registerNumber,
      mobileNumber: user.mobileNumber,
      address: user.address,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Get user profile
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      entryType: user.entryType,
      degreeBranch: user.degreeBranch,
      university: user.university,
      regulation: user.regulation,
      department: user.department,
      startYear: user.startYear,
      endYear: user.endYear,
      collegeName: user.collegeName,
      collegeAddress: user.collegeAddress,
      collegeCode: user.collegeCode,
      registerNumber: user.registerNumber,
      mobileNumber: user.mobileNumber,
      address: user.address,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const oldDepartment = user.department;
    const newDepartment = req.body.department || user.department;

    user.name = req.body.name || user.name;
    user.entryType = req.body.entryType || user.entryType;
    user.degreeBranch = req.body.degreeBranch || user.degreeBranch;
    user.university = req.body.university || user.university;
    user.regulation = req.body.regulation || user.regulation;
    user.department = newDepartment;
    user.startYear = req.body.startYear || user.startYear;
    user.endYear = req.body.endYear || user.endYear;
    user.collegeName = req.body.collegeName || user.collegeName;
    user.collegeAddress = req.body.collegeAddress || user.collegeAddress;
    user.collegeCode = req.body.collegeCode || user.collegeCode;
    user.registerNumber = req.body.registerNumber || user.registerNumber;
    user.mobileNumber = req.body.mobileNumber || user.mobileNumber;
    user.address = req.body.address || user.address;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    // Synchronization logic: Update all related records if department changed
    if (oldDepartment !== newDepartment) {
      console.log(`Syncing department change: ${oldDepartment} -> ${newDepartment}`);
      await Promise.all([
        Subject.updateMany({ createdBy: user._id }, { department: newDepartment }),
        Exam.updateMany({ user: user._id }, { department: newDepartment }),
        Result.updateMany({ user: user._id }, { department: newDepartment })
      ]);
    }

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      entryType: updatedUser.entryType,
      degreeBranch: updatedUser.degreeBranch,
      university: updatedUser.university,
      regulation: updatedUser.regulation,
      department: updatedUser.department,
      startYear: updatedUser.startYear,
      endYear: updatedUser.endYear,
      collegeName: updatedUser.collegeName,
      collegeAddress: updatedUser.collegeAddress,
      collegeCode: updatedUser.collegeCode,
      registerNumber: updatedUser.registerNumber,
      mobileNumber: updatedUser.mobileNumber,
      address: updatedUser.address,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Reset password
const resetPassword = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    user.password = password;
    await user.save();
    res.json({ message: 'Password reset successful' });
  } else {
    res.status(404);
    throw new Error('User not found with this email');
  }
});

export { authUser, getUserProfile, resetPassword, updateUserProfile };

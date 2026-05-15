import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Exam from '../models/Exam.js';
import Result from '../models/Result.js';
import connectDB from '../config/db.js';

dotenv.config();

connectDB();

const seedData = async () => {
  try {
    await User.deleteMany();
    await Exam.deleteMany();
    await Result.deleteMany();

    const adminUser = await User.create({
      name: 'Admin User',
      email: (process.env.SEED_ADMIN_EMAIL || 'admin@gmail.com').toLowerCase().trim(),
      password: process.env.SEED_ADMIN_PASSWORD || 'admin123',
      role: 'admin',
      department: 'Computer Science',
      startYear: '2022',
      endYear: '2026',
      collegeName: 'Gnanastack Institute of Technology',
      collegeAddress: '123 Tech Park, Innovation City',
      collegeCode: 'GIT001',
      registerNumber: '2022CS001',
      mobileNumber: '+91 9876543210',
      address: '456 Garden Street, Peace Avenue',
    });

    console.log('Data Seeded Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();

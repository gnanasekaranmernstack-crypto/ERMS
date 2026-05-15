import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Book from './models/Book.js';

dotenv.config();

const clearBooks = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await Book.deleteMany({});

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

clearBooks();

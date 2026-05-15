import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Book from './models/Book.js';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

const seedBooks = async () => {
  try {
    await connectDB();

    const admin = await User.findOne({ isAdmin: true }) || await User.findOne();
    
    if (!admin) {
      console.error('No user found to associate books with. Please create a user first.');
      process.exit(1);
    }

    await Book.deleteMany();

    const books = [
      {
        title: 'Modern Operating Systems',
        author: 'Andrew S. Tanenbaum',
        subject: 'Operating Systems',
        description: 'A comprehensive guide to the principles and practice of operating systems.',
        semester: 4,
        department: 'CS',
        link: 'https://archive.org/details/modern-operating-systems-4th-edition',
        createdBy: admin._id
      },
      {
        title: 'Database System Concepts',
        author: 'Abraham Silberschatz',
        subject: 'DBMS',
        description: 'The seventh edition of Database System Concepts is appropriate for a first course in databases at the junior or senior undergraduate level.',
        semester: 3,
        department: 'CS',
        link: 'https://www.db-book.com/',
        createdBy: admin._id
      },
      {
        title: 'Computer Networks',
        author: 'Andrew S. Tanenbaum',
        subject: 'Computer Networks',
        description: 'An introduction to the networking field, with detailed coverage of the protocols and standards.',
        semester: 5,
        department: 'IT',
        link: 'https://archive.org/details/computer-networks-5th-edition',
        createdBy: admin._id
      },
      {
        title: 'Software Engineering: A Practitioner\'s Approach',
        author: 'Roger S. Pressman',
        subject: 'Software Engineering',
        description: 'The world\'s most comprehensive guide to software engineering.',
        semester: 4,
        department: 'CS',
        link: 'https://archive.org/details/SoftwareEngineeringAPractitionersApproach7thEditionRogerPressman',
        createdBy: admin._id
      },
      {
        title: 'Signals and Systems',
        author: 'Alan V. Oppenheim',
        subject: 'Digital Signal Processing',
        description: 'A classic textbook on signals and systems.',
        semester: 4,
        department: 'ECE',
        link: 'https://archive.org/details/signalsandsystem0000oppe',
        createdBy: admin._id
      }
    ];

    await Book.insertMany(books);
    console.log('Books Seeded Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedBooks();

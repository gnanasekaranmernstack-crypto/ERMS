import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import dns from 'node:dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();

const verifyUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const email = process.env.SEED_ADMIN_EMAIL;
    const password = process.env.SEED_ADMIN_PASSWORD;
    
    console.log('Verifying User:', email);
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('User NOT FOUND in database!');
    } else {
      console.log('User found! Role:', user.role);
      const isMatch = await bcrypt.compare(password, user.password);
      console.log('Password Match:', isMatch);
      console.log('Hashed Password in DB:', user.password);
    }
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

verifyUser();

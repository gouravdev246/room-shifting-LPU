import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  findUserByRegIdOrPhone,
  findConflictingUser,
  createUser,
} from './auth.model.js';

const JWT_SECRET = process.env.JWT_SECRET || 'lpu_room_shifting_jwt_secret_key_2026_secure';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
};

export const register = async (req, res) => {
  try {
    const { name, reg_id, phone, hostel, password } = req.body;

    if (!name || !reg_id || !phone || !hostel || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required (name, reg_id, phone, hostel, password).',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const cleanRegId = reg_id.trim();
    const cleanPhone = phone.trim();

    const existingUser = await findConflictingUser(cleanRegId, cleanPhone);
    if (existingUser) {
      const conflictField = existingUser.reg_id === cleanRegId ? 'Registration ID' : 'Phone number';
      return res.status(409).json({
        success: false,
        message: `${conflictField} is already registered. Please log in.`,
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await createUser({
      name: name.trim(),
      regId: cleanRegId,
      phone: cleanPhone,
      hostel: hostel.trim(),
      passwordHash,
    });

    const token = generateToken(newUser.id);
    res.cookie('token', token, cookieOptions);

    return res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: newUser,
    });
  } catch (error) {
    console.error('Error during registration:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration.',
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { reg_id, phone, password } = req.body;
    const identifier = reg_id ? reg_id.trim() : phone ? phone.trim() : null;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Registration ID (or Phone) and password are required.',
      });
    }

    const user = await findUserByRegIdOrPhone(identifier);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.',
      });
    }

    const token = generateToken(user.id);
    res.cookie('token', token, cookieOptions);

    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        reg_id: user.reg_id,
        phone: user.phone,
        hostel: user.hostel,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login.',
      error: error.message,
    });
  }
};

export const logout = (req, res) => {
  res.clearCookie('token', cookieOptions);
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

export const getMe = (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
};

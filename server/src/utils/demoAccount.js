import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const DEMO_USERNAME = 'demo_user';
const DEMO_EMAIL = 'demo@nexussocial.local';

const getDemoConfig = () => {
  const password = process.env.DEMO_USER_PASSWORD;

  if (!password || password.length < 6) {
    return null;
  }

  return {
    name: 'Nexus Demo',
    username: DEMO_USERNAME,
    email: DEMO_EMAIL,
    password
  };
};

export const ensureDemoAccount = async () => {
  const demo = getDemoConfig();
  if (!demo) {
    console.warn('Demo account is disabled: DEMO_USER_PASSWORD is not configured.');
    return null;
  }

  const existing = await User.findOne({
    $or: [{ username: demo.username }, { email: demo.email }]
  });

  if (existing) {
    if (existing.username !== demo.username || existing.email !== demo.email) {
      throw new Error('The configured demo account identifiers are already in use.');
    }
    return existing;
  }

  const hashedPassword = await bcrypt.hash(demo.password, 10);
  return User.create({
    name: demo.name,
    username: demo.username,
    email: demo.email,
    password: hashedPassword
  });
};

export const getDemoLoginCredentials = () => {
  const demo = getDemoConfig();
  return demo ? { email: demo.email, password: demo.password } : null;
};

import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';

const DEMO_USERNAME = 'demo_user';
const DEMO_EMAIL = 'demo@nexussocial.local';

const getDemoConfig = () => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return null;
  }

  // Derive a server-only credential from the existing authentication secret.
  // The derived value is never returned to, or bundled with, the client.
  const password = crypto
    .createHash('sha256')
    .update(`nexus-social-demo-account:${jwtSecret}`)
    .digest('base64url');

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
    console.warn('Demo account is unavailable: JWT_SECRET is not configured.');
    return null;
  }

  const existing = await User.findOne({
    $or: [{ username: demo.username }, { email: demo.email }]
  }).select('+password');

  if (existing) {
    if (existing.username !== demo.username || existing.email !== demo.email) {
      throw new Error('The configured demo account identifiers are already in use.');
    }

    const hasExpectedPassword = await bcrypt.compare(demo.password, existing.password);
    if (!hasExpectedPassword) {
      existing.password = await bcrypt.hash(demo.password, 10);
      await existing.save();
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

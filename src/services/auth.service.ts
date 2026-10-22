import { prisma } from '../../lib/prisma';
import { AppError } from '../utils/appError';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import type { LoginInput, RegisterInput } from '../schemas/auth.schema.js';

const publicUser = <T extends { passwordHash?: string }>(user: T) => {
  const { passwordHash: _ignored, ...rest } = user;
  return rest;
};

export const register = async (input: RegisterInput) => {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existing) throw new AppError('Email already registered', 409);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash: await hashPassword(input.password),
      weightUnit: input.weightUnit ?? 'KG',
    },
  });

  const token = signToken({ sub: user.id, email: user.email });
  return { token, user: publicUser(user) };
};

export const login = async (input: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw new AppError('Invalid credentials', 401);

  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) throw new AppError('Invalid credentials', 401);

  const token = signToken({ sub: user.id, email: user.email });
  return { token, user: publicUser(user) };
};

export const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found', 404);
  return publicUser(user);
};

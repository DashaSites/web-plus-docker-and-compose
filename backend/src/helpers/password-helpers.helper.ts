import { genSalt, hash, compare } from 'bcrypt';

const SALT_ROUNDS = 10;

// Хеширую пароль
export const encrypt = async (plainTextPassword: string) => {
  const salt = await genSalt(SALT_ROUNDS);
  const hashedPassword = await hash(plainTextPassword, salt);
  return hashedPassword;
};

// Проверяю, что пароль верный
export const matchPassword = async (
  plainTextPassword: string,
  hashedPassword: string,
) => {
  return await compare(plainTextPassword, hashedPassword);
};

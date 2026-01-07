import bcrypt from "bcrypt";

/**
 * password'u hashleyip DB'ye hash olarak kaydedeceğiz.
 * Asla plain password kaydetmiyoruz.
 */
const SALT_ROUNDS = 10;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

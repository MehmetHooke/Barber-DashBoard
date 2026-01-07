import jwt from "jsonwebtoken";

/**
 * JWT_SECRET: Token imzalamak için gizli anahtar.
 * Bu anahtar yalnızca backend'de bulunur.
 */
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing in .env");
}

/**
 * Token içine koyduğumuz bilgiler:
 * - sub: userId (standart alan)
 * - role: kullanıcı rolü
 */
export type JwtPayload = {
  sub: string;
  role: "USER" | "BARBER";
};

/**
 * signToken:
 * Payload'u SECRET ile imzalar ve token üretir.
 */
export function signToken(payload: JwtPayload) {
  return jwt.sign(payload, JWT_SECRET!, { expiresIn: "7d" });
}

/**
 * verifyToken:
 * Token'ın imzası doğru mu kontrol eder.
 * Doğruysa payload'u döner.
 */
export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET!) as JwtPayload;
}

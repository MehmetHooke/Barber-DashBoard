import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt.js";

/**
 * req.user eklemek için Request'i genişletiyoruz.
 */
export interface AuthRequest extends Request {
  user?: { id: string; role: "USER" | "BARBER" };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  // 1) Authorization header'ını al
  const authHeader = req.headers.authorization;

  // 2) Header yoksa veya Bearer değilse -> 401
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // 3) "Bearer TOKEN" -> TOKEN kısmını al
    const token = authHeader.split(" ")[1];

    // 4) Token'ı doğrula ve payload'u çıkar
    const payload = verifyToken(token);

    // 5) req.user set et (artık controller'lar bunu kullanabilir)
    req.user = { id: payload.sub, role: payload.role };

    // 6) devam et
    next();
  } catch {
    // Token bozuk/expired/sahte
    return res.status(401).json({ message: "Invalid token" });
  }
}

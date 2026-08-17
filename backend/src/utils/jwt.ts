import { createHash, timingSafeEqual } from "node:crypto";
import jwt, { type SignOptions } from "jsonwebtoken";
import type { Env } from "../config/env.js";

export type AccessTokenPayload = {
  sub: string;
  email: string;
  typ: "access";
};

export type RefreshTokenPayload = {
  sub: string;
  email: string;
  typ: "refresh";
};

export function parseDurationToMs(value: string): number {
  const match = /^(\d+)(ms|s|m|h|d)$/.exec(value.trim());
  const amountValue = match?.[1];
  const unit = match?.[2];

  if (!match || !amountValue || !unit) {
    throw new Error(`Invalid duration: ${value}`);
  }

  const amount = Number(amountValue);
  const multipliers = {
    ms: 1,
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  } as const;
  const durationUnit = unit as keyof typeof multipliers;

  if (!(unit in multipliers)) {
    throw new Error(`Invalid duration: ${value}`);
  }

  return amount * multipliers[durationUnit];
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function tokenHashesMatch(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function signAccessToken(payload: Omit<AccessTokenPayload, "typ">, env: Env): string {
  return jwt.sign(
    { ...payload, typ: "access" } satisfies AccessTokenPayload,
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN,
    } as SignOptions,
  );
}

export function signRefreshToken(
  payload: Omit<RefreshTokenPayload, "typ">,
  env: Env,
): string {
  return jwt.sign(
    { ...payload, typ: "refresh" } satisfies RefreshTokenPayload,
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    } as SignOptions,
  );
}

export function verifyAccessToken(token: string, env: Env): AccessTokenPayload {
  const payload = verifyToken(token, env);

  if (payload.typ !== "access") {
    throw new Error("Invalid token payload");
  }

  return payload;
}

export function verifyRefreshToken(token: string, env: Env): RefreshTokenPayload {
  const payload = verifyToken(token, env);

  if (payload.typ !== "refresh") {
    throw new Error("Invalid token payload");
  }

  return payload;
}

function verifyToken(
  token: string,
  env: Env,
): AccessTokenPayload | RefreshTokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET);

  if (typeof decoded !== "object" || decoded === null) {
    throw new Error("Invalid token payload");
  }

  const sub = "sub" in decoded ? decoded.sub : undefined;
  const email = "email" in decoded ? decoded.email : undefined;
  const typ = "typ" in decoded ? decoded.typ : undefined;

  if (typeof sub !== "string" || typeof email !== "string") {
    throw new Error("Invalid token payload");
  }

  if (typ === "access" || typ === "refresh") {
    return { sub, email, typ };
  }

  throw new Error("Invalid token payload");
}

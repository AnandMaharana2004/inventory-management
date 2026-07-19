const MANDATORY_ENV_KEYS = [
  "DATABASE_URL",
  "NODE_ENV",
  "JWT_SECRET",
  "JWT_EXPIRES_IN_DAYS",
] as const;

const missingEnvs = MANDATORY_ENV_KEYS.filter((key) => !process.env[key]);

if (missingEnvs.length > 0) {
  throw new Error(
    `[Env Configuration Error]: Missing mandatory environment variables:\n` +
    missingEnvs.map((env) => `   - ${env}`).join("\n"),
  );
}

export const Env = Object.freeze({
  DATABASE_URL: process.env.DATABASE_URL!,
  NODE_ENV: process.env.NODE_ENV!,
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN_DAYS: Number(process.env.JWT_EXPIRES_IN_DAYS!),

  // seed user details
  SEED_USER_NAME: process.env.SEED_USER_NAME!,
  SEED_USER_PASSWORD: process.env.SEED_USER_PASSWORD!,
  SEED_USER_ROLE: process.env.SEED_USER_ROLE!,
  SEED_USER_CONTACT_NUMBER: process.env.SEED_USER_CONTACT_NUMBER!,
  SEED_USER_EMAIL: process.env.SEED_USER_EMAIL!,
});

export type EnvType = typeof Env;

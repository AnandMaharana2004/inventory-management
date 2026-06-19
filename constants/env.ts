const MANDATORY_ENV_KEYS = ['DATABASE_URL', 'NODE_ENV'] as const;

const missingEnvs = MANDATORY_ENV_KEYS.filter((key) => !process.env[key]);

if (missingEnvs.length > 0) {
  throw new Error(
    `[Env Configuration Error]: Missing mandatory environment variables:\n` +
    missingEnvs.map((env) => `   - ${env}`).join('\n')
  );
}

export const Env = Object.freeze({
  DATABASE_URL: process.env.DATABASE_URL!,
  NODE_ENV: process.env.NODE_ENV!,
});

export type EnvType = typeof Env;
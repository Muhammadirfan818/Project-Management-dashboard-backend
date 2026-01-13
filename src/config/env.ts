import dotenv from "dotenv";

dotenv.config();

const getEnv = (key: string): string | undefined => {
  const value = process.env[key];
  return value;
};

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 5000),

  DATABASE_URL: getEnv("DATABASE_URL"),

  SUPABASE_URL: getEnv("SUPABASE_URL"),
  SUPABASE_ANON_KEY: getEnv("SUPABASE_ANON_KEY"),
  SUPABASE_JWT_SECRET: getEnv("SUPABASE_JWT_SECRET"),
};

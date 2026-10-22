import { execSync } from "node:child_process";

export default function setup() {
  process.env.DATABASE_URL = "file:./test.db";
  process.env.NODE_ENV = "test";
  process.env.ADMIN_TOKEN = "test-admin-token";
  process.env.STRIPE_SECRET_KEY = "";

  execSync("npx prisma db push --force-reset --skip-generate", {
    env: process.env,
    stdio: "ignore",
  });
}

import { type Config } from "drizzle-kit";
import './src/server/db/envConfig';

export default {
  schema: "./src/server/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.POSTGRES_URL!,
  },
  tablesFilter: ["mytretan_*"],
} satisfies Config;

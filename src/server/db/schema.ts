import { relations, sql } from "drizzle-orm";
import {
  index,
  int,
  numeric,
  primaryKey,
  real,
  sqliteTableCreator,
  text,
} from "drizzle-orm/sqlite-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = sqliteTableCreator((name) => `mytretan_${name}`);

export const posts = createTable(
  "post",
  {
    id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    name: text("name", { length: 256 }),
    createdById: text("created_by", { length: 255 })
      .notNull()
      .references(() => users.id),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: int("updatedAt", { mode: "timestamp" }).$onUpdate(
      () => new Date()
    ),
  },
  (example) => ({
    createdByIdIdx: index("created_by_idx").on(example.createdById),
    nameIndex: index("name_idx").on(example.name),
  })
);

export const users = createTable("user", {
  id: text("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name", { length: 255 }).notNull(),
  email: text("email", { length: 255 }).notNull().unique(),
  password: text("password", { length: 255 }).notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(inputProducts),
}));



export const sessions = createTable(
  "session",
  {
    sessionToken: text("session_token", { length: 255 }).notNull().primaryKey(),
    userId: text("userId", { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: int("expires", { mode: "timestamp" }).notNull(),
  },
  (session) => ({
    userIdIdx: index("session_userId_idx").on(session.userId),
  })
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  {
    identifier: text("identifier", { length: 255 }).notNull(),
    token: text("token", { length: 255 }).notNull(),
    expires: int("expires", { mode: "timestamp" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

export const inputProducts = createTable(
  "input_product",
  {
    productId: text("productId").notNull().primaryKey(),
    userId: text("userId", { length: 255 })
      .notNull()
      .references(() => users.id),
    quantity: int("quantity", { mode: "number" }).notNull(),
    supplier: text("supplier", { length: 256 }).notNull(),
    productdate: int("productdate", { mode: "timestamp" }).notNull(),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: int("updatedAt", { mode: "timestamp" }).$onUpdate(
      () => new Date()
    ),
  },

);

export const inputProductsRelations = relations(inputProducts, ({ one, many }) => ({
  user: one(users, { fields: [inputProducts.userId], references: [users.id] }),
  manualBatchProducts: many(manualBatchToProducts)
}))

export const manualBatch = createTable(
  "manual_batch",
  {
    batchId: text("id").notNull().primaryKey(),
    userId: text("userId", { length: 255 })
      .notNull()
      .references(() => users.id),
    grindingId: text("grindingId", { length: 255 }).references(() => grinding.grindingId),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: int("updatedAt", { mode: "timestamp" }).$onUpdate(
      () => new Date()
    ).default(sql`(unixepoch())`)
      .notNull(),
    finishedAt: int("finishedAt", { mode: "timestamp" }),
    status: text("status").$type<"pending" | "completed" | "grinding">().notNull(),
    weight: real("weight"),
  },
)

export const manualBatchRelations = relations(manualBatch, ({ one, many }) => ({
  user: one(users, { fields: [manualBatch.userId], references: [users.id] }),
  manualBatchProducts: many(manualBatchToProducts),
  grinding: one(grinding, { fields: [manualBatch.grindingId], references: [grinding.grindingId] })
}))

export const manualBatchToProducts = createTable(
  "manual_batch_product",
  {
    batchId: text("batchId", { length: 255 })
      .notNull()
      .references(() => manualBatch.batchId),
    productId: text("productId", { length: 255 })
      .notNull()
      .references(() => inputProducts.productId),
    quantity: int("quantity", { mode: "number" }).notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.batchId, t.productId] }),
  }),

)

export const manualBatchProductsRelations = relations(manualBatchToProducts, ({ one }) => ({
  manualBatch: one(manualBatch, {
    fields: [manualBatchToProducts.batchId],
    references: [manualBatch.batchId]
  }),
  product: one(inputProducts, {
    fields: [manualBatchToProducts.productId],
    references: [inputProducts.productId]
  }),
}))

export const grinding = createTable(
  "grinding",
  {
    grindingId: text("grindingId").notNull().primaryKey(),
    userId: text("userId", { length: 255 })
      .notNull()
      .references(() => users.id),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: int("updatedAt", { mode: "timestamp" }).$onUpdate(
      () => new Date()
    ).default(sql`(unixepoch())`)
      .notNull(),
    finishedAt: int("finishedAt", { mode: "timestamp" }),
    status: text("status").$type<"pending" | "completed">().notNull(),
    weight: real("weight")
  },
)

export const grindingRelations = relations(grinding, ({ one, many }) => ({
  user: one(users, { fields: [grinding.userId], references: [users.id] }),
  manualBatch: many(manualBatch)
}))


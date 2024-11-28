import { and, count, eq, relations, SQL, sql } from "drizzle-orm";
import { type AdapterAccount } from "next-auth/adapters";
import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  uniqueIndex,
  pgTableCreator,
  real,
  primaryKey,
  index

} from 'drizzle-orm/pg-core';

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `mytretan_${name}`);

export const users = createTable("user", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(inputProducts),
}));



export const sessions = createTable(
  "session",
  {
    sessionToken: text("session_token").notNull().primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => users.id),
    expires: timestamp("expires").notNull(),
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
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires").notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

export const inputProducts = createTable(
  "input_product",
  {
    productId: text("productId").notNull().primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => users.id),
    input : integer("input").notNull(),
    quantity: integer("quantity").notNull(),
    supplier: text("supplier").notNull(),
    productdate: timestamp("productdate").notNull(),
    createdAt: timestamp("createdAt")
      .default(sql`(now())`)
      .notNull(),
    updatedAt: timestamp("updatedAt").$onUpdate(
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
    userId: text("userId")
      .notNull(),
    grindingId: text("grindingId").references(() => grinding.grindingId),
    createdAt: timestamp("createdAt")
      .default(sql`(now())`)
      .notNull(),
    updatedAt: timestamp("updatedAt").$onUpdate(
      () => new Date()
    ).default(sql`(now())`)
      .notNull(),
    slug: text("slug").notNull(),
    finishedAt: timestamp("finishedAt"),
    status: text("status").$type<"pending" | "completed" | "grinding">().notNull(),
    weight: real("weight"),
  },
)

export const manualBatchRelations = relations(manualBatch, ({ one, many }) => ({
  manualBatchProducts: many(manualBatchToProducts),
  grinding: one(grinding, { fields: [manualBatch.grindingId], references: [grinding.grindingId] })
}))

export const manualBatchToProducts = createTable(
  "manual_batch_product",
  {
    batchId: text("batchId")
      .notNull()
      .references(() => manualBatch.batchId),
    productId: text("productId")
      .notNull()
      .references(() => inputProducts.productId),
    quantity: integer("quantity").notNull(),
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
    userId: text("userId")
      .notNull(),
    createdAt: timestamp("createdAt")
      .default(sql`(now())`)
      .notNull(),
    updatedAt: timestamp("updatedAt").$onUpdate(
      () => new Date()
    ).default(sql`(now())`)
      .notNull(),
    slug: text("slug").notNull(),
    finishedAt: timestamp("finishedAt"),
    status: text("status").$type<"pending" | "completed">().notNull(),
    weight: real("weight")
  },
)

export const grindingRelations = relations(grinding, ({ one, many }) => ({
  manualBatch: many(manualBatch)
}))

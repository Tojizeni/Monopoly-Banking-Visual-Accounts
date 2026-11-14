import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  rooms: defineTable({
    code: v.string(),
    createdAt: v.number(),
    bankBalance: v.optional(v.number()),
  }).index("by_code", ["code"]),

  players: defineTable({
    roomId: v.id("rooms"),
    name: v.string(),
    balance: v.number(),
    isBanker: v.boolean(),
  }).index("by_room", ["roomId"]),

  transactions: defineTable({
    roomId: v.id("rooms"),
    from: v.string(),
    to: v.string(),
    amount: v.number(),
    timestamp: v.number(),
  }).index("by_room", ["roomId"]),

  properties: defineTable({
    roomId: v.id("rooms"),
    name: v.string(),
    price: v.number(),
    ownerId: v.optional(v.id("players")),
    color: v.string(),
    mortgaged: v.optional(v.boolean()),
    houses: v.optional(v.number()),
    hotel: v.optional(v.boolean()),
    rent: v.optional(v.object({
      site: v.number(),
      set: v.number(),
      house1: v.number(),
      house2: v.number(),
      house3: v.number(),
      house4: v.number(),
      hotel: v.number(),
    })),
  }).index("by_room", ["roomId"]),
});
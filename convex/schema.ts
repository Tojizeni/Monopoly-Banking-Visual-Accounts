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
  }).index("by_room", ["roomId"]), // YE LINE ZAROOR HONI CHAHIYE

  transactions: defineTable({
    roomId: v.id("rooms"),
    from: v.string(),
    to: v.string(),
    amount: v.number(),
    timestamp: v.number(),
  }).index("by_room", ["roomId"]), // YE LINE BHI ZAROOR HONI CHAHIYE
});
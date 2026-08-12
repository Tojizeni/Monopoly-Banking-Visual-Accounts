// convex/game.ts
import { query, mutation } from "./_generated/server";
import { MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { v } from "convex/values";

// Helper function to generate a random 4-letter room code
function generateCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

// 1. Create a Room (Called from CreateRoom.jsx)
export const createRoom = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const code = generateCode();
    // Bank ke paas $100,000 rakhenge
    const room = await ctx.db.insert("rooms", { 
      code, 
      createdAt: Date.now(),
      bankBalance: 100000 
    });

    // Ab hum banker ko players list mein nahi daalenge
    return { roomCode: code, roomId: room };
  },
});

// 2. Join a Room (Called from JoinRoom.jsx)
export const joinRoom = mutation({
  args: { code: v.string(), name: v.string() },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .unique();

    if (!room) throw new Error("Room not found. Check the code.");

    const playerId = await ctx.db.insert("players", {
      roomId: room._id,
      name: args.name,
      balance: 1500,
      isBanker: false,
    });

    return { playerId, roomId: room._id };
  },
});

// 3. Get Real-time Game State (Called from RoomPlayer & RoomBanker)
// This is a "query", meaning it runs automatically and updates the UI in real-time
export const getRoomState = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    // YE LINE ZAROOR HONI CHAHIYE
    const room = await ctx.db.get(args.roomId);
    
    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .order("desc")
      .take(10);

    // YAHAN 'room' ZAROOR RETURN HONA CHAHIYE
    return { room, players, transactions };
  },
});

// Helper function to log a transaction (With Proper Types)
async function logTransaction(
  ctx: MutationCtx, 
  roomId: Id<"rooms">, 
  from: string, 
  to: string, 
  amount: number
) {
  await ctx.db.insert("transactions", {
    roomId,
    from,
    to,
    amount,
    timestamp: Date.now(),
  });
}

// 4. Banker Pays Player (Bank -> Player)
export const bankerPayPlayer = mutation({
  args: { playerId: v.id("players"), amount: v.number() },
  handler: async (ctx, args) => {
    const player = await ctx.db.get(args.playerId);
    if (!player) throw new Error("Player not found");

    await ctx.db.patch(args.playerId, { balance: player.balance + args.amount });
    await logTransaction(ctx, player.roomId, "Bank", player.name, args.amount);
  },
});

// 5. Banker Collects from Player (Player -> Bank)
export const bankerCollectPlayer = mutation({
  args: { playerId: v.id("players"), amount: v.number() },
  handler: async (ctx, args) => {
    const player = await ctx.db.get(args.playerId);
    if (!player) throw new Error("Player not found");
    if (player.balance < args.amount) throw new Error("Player has insufficient funds");

    await ctx.db.patch(args.playerId, { balance: player.balance - args.amount });
    await logTransaction(ctx, player.roomId, player.name, "Bank", args.amount);
  },
});

// 6. Player Pays Bank (Player -> Bank)
export const playerPayBank = mutation({
  args: { playerId: v.id("players"), amount: v.number() },
  handler: async (ctx, args) => {
    const player = await ctx.db.get(args.playerId);
    if (!player) throw new Error("Player not found");
    if (player.balance < args.amount) throw new Error("Insufficient funds");

    await ctx.db.patch(args.playerId, { balance: player.balance - args.amount });
    await logTransaction(ctx, player.roomId, player.name, "Bank", args.amount);
  },
});

// 7. Player Pays Another Player (Player A -> Player B)
export const playerPayPlayer = mutation({
  args: { fromId: v.id("players"), toId: v.id("players"), amount: v.number() },
  handler: async (ctx, args) => {
    const fromPlayer = await ctx.db.get(args.fromId);
    const toPlayer = await ctx.db.get(args.toId);
    
    if (!fromPlayer || !toPlayer) throw new Error("Player not found");
    if (fromPlayer.balance < args.amount) throw new Error("Insufficient funds");

    await ctx.db.patch(args.fromId, { balance: fromPlayer.balance - args.amount });
    await ctx.db.patch(args.toId, { balance: toPlayer.balance + args.amount });
    
    await logTransaction(ctx, fromPlayer.roomId, fromPlayer.name, toPlayer.name, args.amount);
  },
});

// 8. Banker leaves -> Delete the entire room and all its data
export const deleteRoom = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    // Saare players delete karo
    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();
    for (const player of players) {
      await ctx.db.delete(player._id);
    }

    // Saari transactions delete karo
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();
    for (const tx of transactions) {
      await ctx.db.delete(tx._id);
    }

    // Room ko delete karo (Agar exist karta hai toh)
    const room = await ctx.db.get(args.roomId);
    if (room) {
        await ctx.db.delete(args.roomId);
    }
  },
});

// 9. Player leaves -> Delete only the player from the room
export const leaveRoom = mutation({
  args: { playerId: v.id("players") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.playerId);
  },
});
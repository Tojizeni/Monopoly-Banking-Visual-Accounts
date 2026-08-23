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

  // Standard UK (London) Monopoly Properties list
const propertyList = [
  { name: "Old Kent Road", price: 60, color: "brown" },
  { name: "Whitechapel Road", price: 60, color: "brown" },
  { name: "The Angel, Islington", price: 100, color: "lightblue" },
  { name: "Euston Road", price: 100, color: "lightblue" },
  { name: "Pentonville Road", price: 120, color: "lightblue" },
  { name: "Pall Mall", price: 140, color: "pink" },
  { name: "Whitehall", price: 140, color: "pink" },
  { name: "Northumberland Avenue", price: 160, color: "pink" },
  { name: "Bow Street", price: 180, color: "orange" },
  { name: "Marlborough Street", price: 180, color: "orange" },
  { name: "Vine Street", price: 200, color: "orange" },
  { name: "Strand", price: 220, color: "red" },
  { name: "Fleet Street", price: 220, color: "red" },
  { name: "Trafalgar Square", price: 240, color: "red" },
  { name: "Leicester Square", price: 260, color: "yellow" },
  { name: "Coventry Street", price: 260, color: "yellow" },
  { name: "Piccadilly", price: 280, color: "yellow" },
  { name: "Regent Street", price: 300, color: "green" },
  { name: "Oxford Street", price: 300, color: "green" },
  { name: "Bond Street", price: 320, color: "green" },
  { name: "Park Lane", price: 350, color: "darkblue" },
  { name: "Mayfair", price: 400, color: "darkblue" },
  // Stations
  { name: "King's Cross Station", price: 200, color: "black" },
  { name: "Marylebone Station", price: 200, color: "black" },
  { name: "Fenchurch St. Station", price: 200, color: "black" },
  { name: "Liverpool St. Station", price: 200, color: "black" },
  // Utilities
  { name: "Electric Company", price: 150, color: "white" },
  { name: "Water Works", price: 150, color: "white" },
];

// Room banane ke turant baad properties database mein daal do
for (const prop of propertyList) {
  await ctx.db.insert("properties", {
    roomId: room,
    name: prop.name,
    price: prop.price,
    color: prop.color,
    ownerId: undefined, // Shuru mein sab Bank ki hain
  });
}

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

    // YE LINE ADD KARNI HAI PROPERTIES LANE KE LIYE
    const properties = await ctx.db
      .query("properties")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    return { room, players, transactions, properties };
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

    // YE LOOP ADD KARO: Saari properties delete karo
    const properties = await ctx.db
      .query("properties")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();
    for (const prop of properties) {
      await ctx.db.delete(prop._id);
    }

    // Room ko delete karo (Agar exist karta hai toh)

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

// 10. Banker sells a property to a player (Supports Auctions with Custom Price)
export const buyProperty = mutation({
  args: { 
    propertyId: v.id("properties"), 
    playerId: v.id("players"),
    customPrice: v.optional(v.number()) // YE LINE ADD KARNI HAI
  },
  handler: async (ctx, args) => {
    const property = await ctx.db.get(args.propertyId);
    const player = await ctx.db.get(args.playerId);
    
    if (!property || !player) throw new Error("Property or Player not found");
    if (property.ownerId) throw new Error("Property already owned");

    // Agar custom price (auction) hai toh wo use karo, warna original price
    const finalPrice = args.customPrice !== undefined ? args.customPrice : property.price;
    
    if (player.balance < finalPrice) throw new Error("Insufficient funds");

    // 1. Player se paise kato
    await ctx.db.patch(args.playerId, { balance: player.balance - finalPrice });
    // 2. Property player ko assign karo
    await ctx.db.patch(args.propertyId, { ownerId: args.playerId });
    
    await logTransaction(ctx, player.roomId, player.name, "Bank (Property)", finalPrice);
  },
});

// 11. Trade property between two players (Player A gives property to Player B)
export const tradeProperty = mutation({
  args: { propertyId: v.id("properties"), toPlayerId: v.id("players") },
  handler: async (ctx, args) => {
    const property = await ctx.db.get(args.propertyId);
    if (!property || !property.ownerId) throw new Error("Property has no owner");

       // Pehle purana malik (fromPlayer) nikal lo
    const fromPlayer = await ctx.db.get(property.ownerId);
    const toPlayer = await ctx.db.get(args.toPlayerId);

    // Ab property ka malik badal do
    await ctx.db.patch(args.propertyId, { ownerId: args.toPlayerId });
    
    // Transaction log karo
    if (fromPlayer && toPlayer) {
      await logTransaction(ctx, fromPlayer.roomId, fromPlayer.name, toPlayer.name, 0);
    }
  },
});

// 12. Player mortgages a property to the Bank
export const mortgageProperty = mutation({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const property = await ctx.db.get(args.propertyId);
    if (!property || !property.ownerId) throw new Error("Property has no owner");
    if (property.mortgaged) throw new Error("Property is already mortgaged");

    const player = await ctx.db.get(property.ownerId);
    if (!player) throw new Error("Player not found");

    const loanAmount = Math.floor(property.price / 2);

    // Player ko aadhe paise do
    await ctx.db.patch(player._id, { balance: player.balance + loanAmount });
    // Property ko mortgaged mark karo
    await ctx.db.patch(args.propertyId, { mortgaged: true });

    await logTransaction(ctx, player.roomId, "Bank (Mortgage)", player.name, loanAmount);
  },
});

// 13. Player repays the mortgage to get property back
export const unmortgageProperty = mutation({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const property = await ctx.db.get(args.propertyId);
    if (!property || !property.ownerId) throw new Error("Property has no owner");
    if (!property.mortgaged) throw new Error("Property is not mortgaged");

    const player = await ctx.db.get(property.ownerId);
    if (!player) throw new Error("Player not found");

    const repayAmount = Math.floor(property.price / 2); // 10% interest ignore for simplicity
    if (player.balance < repayAmount) throw new Error("Insufficient funds to unmortgage");

    // Player se paise wapas le lo
    await ctx.db.patch(player._id, { balance: player.balance - repayAmount });
    // Property ko unmortgaged mark karo
    await ctx.db.patch(args.propertyId, { mortgaged: false });

    await logTransaction(ctx, player.roomId, player.name, "Bank (Unmortgage)", repayAmount);
  },
});
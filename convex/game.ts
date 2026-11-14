// convex/game.ts
import { query, mutation } from "./_generated/server";
import { MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { v } from "convex/values";

function generateCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

// House building cost by color group
const HOUSE_COST: Record<string, number> = {
  brown: 50, lightblue: 50,
  pink: 100, orange: 100,
  red: 150, yellow: 150,
  green: 200, darkblue: 200,
};

// Standard UK (London) Monopoly Properties with full Rent Table
const propertyList = [
  { name: "Old Kent Road", price: 60, color: "brown", rent: { site: 2, set: 4, house1: 10, house2: 30, house3: 90, house4: 160, hotel: 250 } },
  { name: "Whitechapel Road", price: 60, color: "brown", rent: { site: 4, set: 8, house1: 20, house2: 60, house3: 180, house4: 320, hotel: 450 } },
  { name: "The Angel, Islington", price: 100, color: "lightblue", rent: { site: 6, set: 12, house1: 30, house2: 90, house3: 270, house4: 400, hotel: 550 } },
  { name: "Euston Road", price: 100, color: "lightblue", rent: { site: 6, set: 12, house1: 30, house2: 90, house3: 270, house4: 400, hotel: 550 } },
  { name: "Pentonville Road", price: 120, color: "lightblue", rent: { site: 8, set: 16, house1: 40, house2: 100, house3: 300, house4: 450, hotel: 600 } },
  { name: "Pall Mall", price: 140, color: "pink", rent: { site: 10, set: 20, house1: 50, house2: 150, house3: 450, house4: 625, hotel: 750 } },
  { name: "Whitehall", price: 140, color: "pink", rent: { site: 10, set: 20, house1: 50, house2: 150, house3: 450, house4: 625, hotel: 750 } },
  { name: "Northumberland Avenue", price: 160, color: "pink", rent: { site: 12, set: 24, house1: 60, house2: 180, house3: 500, house4: 700, hotel: 900 } },
  { name: "Bow Street", price: 180, color: "orange", rent: { site: 14, set: 28, house1: 70, house2: 200, house3: 550, house4: 750, hotel: 950 } },
  { name: "Marlborough Street", price: 180, color: "orange", rent: { site: 14, set: 28, house1: 70, house2: 200, house3: 550, house4: 750, hotel: 950 } },
  { name: "Vine Street", price: 200, color: "orange", rent: { site: 16, set: 32, house1: 80, house2: 220, house3: 600, house4: 800, hotel: 1000 } },
  { name: "Strand", price: 220, color: "red", rent: { site: 18, set: 36, house1: 90, house2: 250, house3: 700, house4: 875, hotel: 1050 } },
  { name: "Fleet Street", price: 220, color: "red", rent: { site: 18, set: 36, house1: 90, house2: 250, house3: 700, house4: 875, hotel: 1050 } },
  { name: "Trafalgar Square", price: 240, color: "red", rent: { site: 20, set: 40, house1: 100, house2: 300, house3: 750, house4: 925, hotel: 1100 } },
  { name: "Leicester Square", price: 260, color: "yellow", rent: { site: 22, set: 44, house1: 110, house2: 330, house3: 800, house4: 975, hotel: 1150 } },
  { name: "Coventry Street", price: 260, color: "yellow", rent: { site: 22, set: 44, house1: 110, house2: 330, house3: 800, house4: 975, hotel: 1150 } },
  { name: "Piccadilly", price: 280, color: "yellow", rent: { site: 24, set: 48, house1: 120, house2: 360, house3: 850, house4: 1000, hotel: 1200 } },
  { name: "Regent Street", price: 300, color: "green", rent: { site: 26, set: 52, house1: 130, house2: 390, house3: 900, house4: 1100, hotel: 1275 } },
  { name: "Oxford Street", price: 300, color: "green", rent: { site: 26, set: 52, house1: 130, house2: 390, house3: 900, house4: 1100, hotel: 1275 } },
  { name: "Bond Street", price: 320, color: "green", rent: { site: 28, set: 56, house1: 150, house2: 450, house3: 1000, house4: 1200, hotel: 1400 } },
  { name: "Park Lane", price: 350, color: "darkblue", rent: { site: 35, set: 70, house1: 175, house2: 500, house3: 1100, house4: 1300, hotel: 1500 } },
  { name: "Mayfair", price: 400, color: "darkblue", rent: { site: 50, set: 100, house1: 200, house2: 600, house3: 1400, house4: 1700, hotel: 2000 } },
  // Stations (rent based on how many stations owner has)
  { name: "King's Cross Station", price: 200, color: "black" },
  { name: "Marylebone Station", price: 200, color: "black" },
  { name: "Fenchurch St. Station", price: 200, color: "black" },
  { name: "Liverpool St. Station", price: 200, color: "black" },
  // Utilities (4x / 10x dice roll)
  { name: "Electric Company", price: 150, color: "white" },
  { name: "Water Works", price: 150, color: "white" },
];

// 1. Create a Room
export const createRoom = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const code = generateCode();
    const room = await ctx.db.insert("rooms", { 
      code, 
      createdAt: Date.now(),
      bankBalance: 100000 
    });

    for (const prop of propertyList) {
      await ctx.db.insert("properties", {
        roomId: room,
        name: prop.name,
        price: prop.price,
        color: prop.color,
        rent: "rent" in prop ? prop.rent : undefined,
        houses: 0,
        hotel: false,
      });
    }

    return { roomCode: code, roomId: room };
  },
});

// 2. Join a Room
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

// 3. Get Real-time Game State
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

    const properties = await ctx.db
      .query("properties")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    return { room, players, transactions, properties };
  },
});

// Helper: Log Transaction
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

// Helper: Get all properties of same color group in a room
async function getColorGroup(ctx: MutationCtx, roomId: Id<"rooms">, color: string) {
  return await ctx.db
    .query("properties")
    .withIndex("by_room", (q) => q.eq("roomId", roomId))
    .filter((q) => q.eq(q.field("color"), color))
    .collect();
}

// 4. Banker Pays Player
export const bankerPayPlayer = mutation({
  args: { playerId: v.id("players"), amount: v.number() },
  handler: async (ctx, args) => {
    const player = await ctx.db.get(args.playerId);
    if (!player) throw new Error("Player not found");

    await ctx.db.patch(args.playerId, { balance: player.balance + args.amount });
    await logTransaction(ctx, player.roomId, "Bank", player.name, args.amount);
  },
});

// 5. Banker Collects from Player
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

// 6. Player Pays Bank
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

// 7. Player Pays Another Player
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

// 8. Banker deletes the entire room
export const deleteRoom = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();
    for (const player of players) {
      await ctx.db.delete(player._id);
    }

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();
    for (const tx of transactions) {
      await ctx.db.delete(tx._id);
    }

    const properties = await ctx.db
      .query("properties")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();
    for (const prop of properties) {
      await ctx.db.delete(prop._id);
    }

    const room = await ctx.db.get(args.roomId);
    if (room) {
        await ctx.db.delete(args.roomId);
    }
  },
});

// 9. Player leaves the room
export const leaveRoom = mutation({
  args: { playerId: v.id("players") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.playerId);
  },
});

// 10. Banker sells a property (supports Auction Custom Price)
export const buyProperty = mutation({
  args: { 
    propertyId: v.id("properties"), 
    playerId: v.id("players"),
    customPrice: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const property = await ctx.db.get(args.propertyId);
    const player = await ctx.db.get(args.playerId);
    
    if (!property || !player) throw new Error("Property or Player not found");
    if (property.ownerId) throw new Error("Property already owned");

    const finalPrice = args.customPrice !== undefined ? args.customPrice : property.price;
    
    if (player.balance < finalPrice) throw new Error("Insufficient funds");

    await ctx.db.patch(args.playerId, { balance: player.balance - finalPrice });
    await ctx.db.patch(args.propertyId, { ownerId: args.playerId });
    
    await logTransaction(ctx, player.roomId, player.name, "Bank (Property)", finalPrice);
  },
});

// 11. Trade property between players
export const tradeProperty = mutation({
  args: { propertyId: v.id("properties"), toPlayerId: v.id("players") },
  handler: async (ctx, args) => {
    const property = await ctx.db.get(args.propertyId);
    if (!property || !property.ownerId) throw new Error("Property has no owner");

    const fromPlayer = await ctx.db.get(property.ownerId);
    const toPlayer = await ctx.db.get(args.toPlayerId);
    if (!fromPlayer || !toPlayer) throw new Error("Player not found");

    await ctx.db.patch(args.propertyId, { ownerId: args.toPlayerId });
    
    await logTransaction(ctx, fromPlayer.roomId, fromPlayer.name, `${toPlayer.name} (Trade)`, 0);
  },
});

// 12. Mortgage a property
export const mortgageProperty = mutation({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const property = await ctx.db.get(args.propertyId);
    if (!property || !property.ownerId) throw new Error("Property has no owner");
    if (property.mortgaged) throw new Error("Property is already mortgaged");

    const player = await ctx.db.get(property.ownerId);
    if (!player) throw new Error("Player not found");

    const loanAmount = Math.floor(property.price / 2);

    await ctx.db.patch(player._id, { balance: player.balance + loanAmount });
    await ctx.db.patch(args.propertyId, { mortgaged: true });

    await logTransaction(ctx, player.roomId, "Bank (Mortgage)", player.name, loanAmount);
  },
});

// 13. Unmortgage a property
export const unmortgageProperty = mutation({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const property = await ctx.db.get(args.propertyId);
    if (!property || !property.ownerId) throw new Error("Property has no owner");
    if (!property.mortgaged) throw new Error("Property is not mortgaged");

    const player = await ctx.db.get(property.ownerId);
    if (!player) throw new Error("Player not found");

    const repayAmount = Math.floor(property.price / 2);
    if (player.balance < repayAmount) throw new Error("Insufficient funds to unmortgage");

    await ctx.db.patch(player._id, { balance: player.balance - repayAmount });
    await ctx.db.patch(args.propertyId, { mortgaged: false });

    await logTransaction(ctx, player.roomId, player.name, "Bank (Unmortgage)", repayAmount);
  },
});

// 14. Build a House (requires FULL color set, even building rule)
export const buyHouse = mutation({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const property = await ctx.db.get(args.propertyId);
    if (!property || !property.ownerId) throw new Error("Property has no owner");
    if (property.mortgaged) throw new Error("Cannot build on mortgaged property");
    if (property.hotel) throw new Error("Hotel already built");
    
    const houses = property.houses || 0;
    if (houses >= 4) throw new Error("Max houses reached - build a hotel instead");

    // Full color set check
    const group = await getColorGroup(ctx, property.roomId, property.color);
    const ownsAll = group.every(p => p.ownerId === property.ownerId && !p.mortgaged);
    if (!ownsAll) throw new Error("You must own the FULL color set (unmortgaged) to build houses");

    // Even building rule
    const minHouses = Math.min(...group.map(p => p.houses || 0));
    if (houses > minHouses) throw new Error("Even building rule: build evenly across the whole set first");

    const cost = HOUSE_COST[property.color];
    const player = await ctx.db.get(property.ownerId);
    if (!player) throw new Error("Player not found");
    if (player.balance < cost) throw new Error(`Insufficient funds. House costs $${cost}`);

    await ctx.db.patch(player._id, { balance: player.balance - cost });
    await ctx.db.patch(args.propertyId, { houses: houses + 1 });

    await logTransaction(ctx, player.roomId, player.name, `Bank (House on ${property.name})`, cost);
  },
});

// 15. Build a Hotel (requires 4 houses)
export const buyHotel = mutation({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const property = await ctx.db.get(args.propertyId);
    if (!property || !property.ownerId) throw new Error("Property has no owner");
    if (property.hotel) throw new Error("Hotel already built");

    const houses = property.houses || 0;
    if (houses < 4) throw new Error("You need 4 houses before building a hotel");

    const cost = HOUSE_COST[property.color];
    const player = await ctx.db.get(property.ownerId);
    if (!player) throw new Error("Player not found");
    if (player.balance < cost) throw new Error(`Insufficient funds. Hotel costs $${cost}`);

    await ctx.db.patch(player._id, { balance: player.balance - cost });
    await ctx.db.patch(args.propertyId, { hotel: true, houses: 0 });

    await logTransaction(ctx, player.roomId, player.name, `Bank (Hotel on ${property.name})`, cost);
  },
});

// 16. Sell a building back to Bank (half price refund)
export const sellBuilding = mutation({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const property = await ctx.db.get(args.propertyId);
    if (!property || !property.ownerId) throw new Error("Property has no owner");

    const player = await ctx.db.get(property.ownerId);
    if (!player) throw new Error("Player not found");

    if (property.hotel) {
      // Hotel goes back to 4 houses
      await ctx.db.patch(args.propertyId, { hotel: false, houses: 4 });
    } else if ((property.houses || 0) > 0) {
      // Even selling rule
      const group = await getColorGroup(ctx, property.roomId, property.color);
      const myLevel = property.houses || 0;
      const minLevel = Math.min(...group.map(p => p.hotel ? 5 : (p.houses || 0)));
      if (myLevel > minLevel) throw new Error("Even selling rule: sell from the most built property first");
      await ctx.db.patch(args.propertyId, { houses: myLevel - 1 });
    } else {
      throw new Error("No buildings to sell");
    }

    const refund = Math.floor((HOUSE_COST[property.color] || 0) / 2);
    await ctx.db.patch(player._id, { balance: player.balance + refund });

    await logTransaction(ctx, player.roomId, `Bank (Sold building on ${property.name})`, player.name, refund);
  },
});

// 17. Pay Rent to the owner of a property
export const payRent = mutation({
  args: { propertyId: v.id("properties"), payerId: v.id("players"), diceRoll: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const property = await ctx.db.get(args.propertyId);
    const payer = await ctx.db.get(args.payerId);
    if (!property || !payer) throw new Error("Property or Player not found");
    if (!property.ownerId) throw new Error("This property is unowned - no rent needed");
    if (property.mortgaged) throw new Error("This property is mortgaged - no rent needed");
    if (property.ownerId === args.payerId) throw new Error("You own this property!");

    const owner = await ctx.db.get(property.ownerId);
    if (!owner) throw new Error("Owner not found");

    let rent = 0;

    if (property.color === "black") {
      // Station: rent depends on how many stations the owner has
      const stations = (await getColorGroup(ctx, property.roomId, "black"))
        .filter(s => s.ownerId === property.ownerId && !s.mortgaged).length;
      rent = [0, 25, 50, 100, 200][stations];
    } else if (property.color === "white") {
      // Utility: 4x dice (1 owned) or 10x dice (2 owned)
      const utils = (await getColorGroup(ctx, property.roomId, "white"))
        .filter(s => s.ownerId === property.ownerId && !s.mortgaged).length;
      const multiplier = utils >= 2 ? 10 : 4;
      const dice = args.diceRoll || 7;
      rent = multiplier * dice;
    } else {
      // Normal property
      if (!property.rent) throw new Error("This room has no rent data. Please create a new room.");
      const r = property.rent;
      if (property.hotel) rent = r.hotel;
      else if ((property.houses || 0) === 4) rent = r.house4;
      else if ((property.houses || 0) === 3) rent = r.house3;
      else if ((property.houses || 0) === 2) rent = r.house2;
      else if ((property.houses || 0) === 1) rent = r.house1;
      else {
        // No houses: double rent if owner has full set
        const group = await getColorGroup(ctx, property.roomId, property.color);
        const ownsAll = group.every(p => p.ownerId === property.ownerId && !p.mortgaged);
        rent = ownsAll ? r.set : r.site;
      }
    }

    if (payer.balance < rent) throw new Error(`Insufficient funds. Rent is $${rent}`);

    await ctx.db.patch(args.payerId, { balance: payer.balance - rent });
    await ctx.db.patch(property.ownerId, { balance: owner.balance + rent });

    await logTransaction(ctx, payer.roomId, `${payer.name} (Rent: ${property.name})`, owner.name, rent);

    return { rent, ownerName: owner.name, propertyName: property.name };
  },
});
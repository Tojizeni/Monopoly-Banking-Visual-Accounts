// All room data lives in localStorage so it survives refreshes and syncs
// across tabs on the same browser (via the native "storage" event).
// There's no backend here, so two people on two different devices won't
// see each other's actions in real time — swapping this module for calls
// to a real API/WebSocket server is the way to support that.

const STORAGE_PREFIX = 'monopoly_room_';
const MAX_HISTORY = 200;

function roomKey(id) {
  return `${STORAGE_PREFIX}${id}`;
}

function generateRoomCode() {
  // Avoid ambiguous characters (0/O, 1/I) so codes are easy to read aloud/type.
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getRoom(roomId) {
  if (!roomId) return null;
  try {
    const raw = localStorage.getItem(roomKey(roomId));
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('Failed to read room from storage', e);
    return null;
  }
}

export function saveRoom(room) {
  localStorage.setItem(roomKey(room.id), JSON.stringify(room));
  return room;
}

export function roomExists(roomId) {
  return getRoom(roomId) !== null;
}

export function createRoom(bankerName, startingBalance = 1500) {
  let id = generateRoomCode();
  let attempts = 0;
  while (roomExists(id) && attempts < 10) {
    id = generateRoomCode();
    attempts += 1;
  }

  const bankerId = generateId();
  const room = {
    id,
    createdAt: Date.now(),
    startingBalance,
    players: [
      { id: bankerId, name: bankerName.trim(), balance: startingBalance, isBanker: true },
    ],
    transactions: [],
  };
  saveRoom(room);
  return { room, bankerId };
}

export function joinRoom(roomId, playerName) {
  const room = getRoom(roomId);
  if (!room) {
    return { error: 'Room not found. Double-check the code and try again.' };
  }
  const trimmed = playerName.trim();
  if (!trimmed) {
    return { error: 'Enter a name to join.' };
  }
  const nameTaken = room.players.some(
    (p) => p.name.toLowerCase() === trimmed.toLowerCase()
  );
  if (nameTaken) {
    return { error: 'That name is already taken in this room. Try another.' };
  }

  const playerId = generateId();
  room.players.push({
    id: playerId,
    name: trimmed,
    balance: room.startingBalance ?? 1500,
    isBanker: false,
  });
  saveRoom(room);
  return { room, playerId };
}

export function addTransaction(room, { from, to, amount }) {
  const tx = { id: generateId(), from, to, amount, timestamp: Date.now() };
  room.transactions = [tx, ...room.transactions].slice(0, MAX_HISTORY);
  saveRoom(room);
  return room;
}

export function adjustBalance(room, playerId, delta) {
  const player = room.players.find((p) => p.id === playerId);
  if (!player) return room;
  player.balance += delta;
  saveRoom(room);
  return room;
}

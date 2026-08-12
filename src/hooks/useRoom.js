import { useState, useEffect, useCallback } from 'react';
import { getRoom, addTransaction, adjustBalance } from '../utils/roomStore';

export default function useRoom(roomId) {
  const [room, setRoom] = useState(() => getRoom(roomId));
  const [error, setError] = useState(null);

  // Re-load whenever the room id changes (e.g. navigating between rooms).
  useEffect(() => {
    setRoom(getRoom(roomId));
  }, [roomId]);

  // Stay in sync with changes made in other tabs (e.g. the banker's tab
  // updating a balance while a player's tab is open).
  useEffect(() => {
    function handleStorage(e) {
      if (e.key === `monopoly_room_${roomId}`) {
        setRoom(e.newValue ? JSON.parse(e.newValue) : null);
      }
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [roomId]);

  const refresh = useCallback(() => setRoom(getRoom(roomId)), [roomId]);

  const findPlayer = (current, id) => current.players.find((p) => p.id === id);

  const distribute = useCallback((playerId, amount) => {
    setError(null);
    const current = getRoom(roomId);
    if (!current) return false;
    const player = findPlayer(current, playerId);
    if (!player) { setError('Select a player first.'); return false; }
    if (!(amount > 0)) { setError('Enter an amount greater than $0.'); return false; }

    adjustBalance(current, playerId, amount);
    addTransaction(current, { from: 'Bank', to: player.name, amount });
    setRoom({ ...current });
    return true;
  }, [roomId]);

  const collect = useCallback((playerId, amount) => {
    setError(null);
    const current = getRoom(roomId);
    if (!current) return false;
    const player = findPlayer(current, playerId);
    if (!player) { setError('Select a player first.'); return false; }
    if (!(amount > 0)) { setError('Enter an amount greater than $0.'); return false; }
    if (player.balance < amount) { setError(`${player.name} only has $${player.balance}.`); return false; }

    adjustBalance(current, playerId, -amount);
    addTransaction(current, { from: player.name, to: 'Bank', amount });
    setRoom({ ...current });
    return true;
  }, [roomId]);

  const payBank = useCallback((playerId, amount) => {
    setError(null);
    const current = getRoom(roomId);
    if (!current) return false;
    const player = findPlayer(current, playerId);
    if (!player) { setError('Player not found.'); return false; }
    if (!(amount > 0)) { setError('Enter an amount greater than $0.'); return false; }
    if (player.balance < amount) { setError(`You only have $${player.balance}.`); return false; }

    adjustBalance(current, playerId, -amount);
    addTransaction(current, { from: player.name, to: 'Bank', amount });
    setRoom({ ...current });
    return true;
  }, [roomId]);

  const payPlayer = useCallback((fromId, toId, amount) => {
    setError(null);
    const current = getRoom(roomId);
    if (!current) return false;
    const sender = findPlayer(current, fromId);
    const receiver = findPlayer(current, toId);
    if (!sender || !receiver) { setError('Select a player first.'); return false; }
    if (sender.id === receiver.id) { setError('You cannot pay yourself.'); return false; }
    if (!(amount > 0)) { setError('Enter an amount greater than $0.'); return false; }
    if (sender.balance < amount) { setError(`You only have $${sender.balance}.`); return false; }

    adjustBalance(current, fromId, -amount);
    adjustBalance(current, toId, amount);
    addTransaction(current, { from: sender.name, to: receiver.name, amount });
    setRoom({ ...current });
    return true;
  }, [roomId]);

  return { room, error, setError, refresh, distribute, collect, payBank, payPlayer };
}

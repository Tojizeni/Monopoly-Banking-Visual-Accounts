// Identity is stored in sessionStorage (not localStorage) so each browser
// tab can act as a distinct participant — e.g. one tab as the banker,
// another as a player — which is convenient for testing and for a single
// device passed around a physical table.

const IDENTITY_PREFIX = 'monopoly_identity_';

export function getIdentity(roomId) {
  try {
    const raw = sessionStorage.getItem(`${IDENTITY_PREFIX}${roomId}`);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('Failed to read identity', e);
    return null;
  }
}

export function setIdentity(roomId, identity) {
  sessionStorage.setItem(`${IDENTITY_PREFIX}${roomId}`, JSON.stringify(identity));
}

export function clearIdentity(roomId) {
  sessionStorage.removeItem(`${IDENTITY_PREFIX}${roomId}`);
}

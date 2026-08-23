import React from 'react';

export default function PlayerList({ players, bankBalance, onKickPlayer, currentPlayerId }) {
    const safePlayers = players || [];

    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5 shadow-xl h-full">
            <h3 className="text-lg font-bold text-white border-b border-gray-700 pb-3 mb-4">
                Game Lobby
            </h3>

            {/* Banker / Bank Entry */}
            <div className="flex items-center justify-between bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center font-bold text-sm text-black">
                        🏦
                    </div>
                    <div>
                        <p className="font-medium text-yellow-400 text-sm">Banker (Host)</p>
                    </div>
                </div>
                <p className="font-mono text-yellow-400 font-semibold">
                    ${bankBalance || 100000}
                </p>
            </div>

            {/* Players List */}
            <div className="space-y-3">
                {safePlayers.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-4">Waiting for players to join...</p>
                )}
                {safePlayers.map(player => {
                    // Agar currentPlayerId pass hua hai (Player view), toh sirf apna balance dikhao
                    const showBalance = !currentPlayerId || String(player._id) === String(currentPlayerId);

                    return (
                        <div key={player._id} className="flex items-center justify-between bg-gray-900/50 p-3 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-sm">
                                    {player.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-medium text-white text-sm">
                                        {player.name}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <p className="font-mono text-emerald-400 font-semibold">
                                    {showBalance ? `$${player.balance}` : '🔒 Hidden'}
                                </p>

                                {onKickPlayer && (
                                    <button
                                        onClick={() => {
                                            if (window.confirm(`Remove ${player.name} from the game?`)) {
                                                onKickPlayer(player._id);
                                            }
                                        }}
                                        className="text-gray-500 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-500/10"
                                        title={`Kick ${player.name}`}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
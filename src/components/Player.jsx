import React, { useState } from 'react';

export default function Player({ currentPlayer, players, error, onPayBank, onPayPlayer }) {
    const [payBankAmount, setPayBankAmount] = useState('');
    const [payPlayerAmount, setPayPlayerAmount] = useState('');
    const [selectedPlayerId, setSelectedPlayerId] = useState('');
    const [localError, setLocalError] = useState('');

    if (!currentPlayer) return null;

    // Khud ko chhod kar baaki sabko list karo
    const otherPlayers = players.filter((p) => p._id !== currentPlayer._id);

    const handlePayBank = async () => {
        setLocalError('');
        const amount = Number(payBankAmount);
        if (!(amount > 0)) { setLocalError('Enter an amount greater than $0.'); return; }

        try {
            // ID '_id' se aayegi (Convex rule)
            await onPayBank(currentPlayer._id, amount);
            setPayBankAmount(''); // Safely clear input
        } catch (err) {
            setLocalError(err.message);
        }
    };

    const handlePayPlayer = async () => {
        setLocalError('');
        if (!selectedPlayerId) { setLocalError('Select a player to pay.'); return; }
        const amount = Number(payPlayerAmount);
        if (!(amount > 0)) { setLocalError('Enter an amount greater than $0.'); return; }

        try {
            await onPayPlayer(currentPlayer._id, selectedPlayerId, amount);
            setPayPlayerAmount('');
            setSelectedPlayerId('');
        } catch (err) {
            setLocalError(err.message);
        }
    };

    const displayError = localError || error;

    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 shadow-xl">

            {/* Player Balance & Auto-Collect Notice */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-6 border-b border-gray-700">
                <div className="mb-4 sm:mb-0">
                    <p className="text-sm text-gray-400 uppercase tracking-wider">Your Balance</p>
                    <h2 className="text-4xl font-extrabold text-emerald-400 mt-1">
                        ${currentPlayer.balance}
                    </h2>
                </div>
                <div className="bg-blue-500/10 text-blue-400 px-4 py-2 rounded-lg text-xs font-medium border border-blue-500/20 flex items-center gap-2 max-w-xs">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Incoming funds are auto-deposited
                </div>
            </div>

            {displayError && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2 mb-6">
                    {displayError}
                </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Pay Bank (Player -> Bank) */}
                <div className="bg-red-900/20 border border-red-700/50 p-5 rounded-xl flex flex-col">
                    <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
                        <span>🏛️</span> Pay Bank
                    </h3>
                    <p className="text-xs text-gray-400 mb-4">Pay taxes, fees, or purchase properties.</p>

                    <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                        <input
                            type="number"
                            min="0"
                            placeholder="Amount ($)"
                            value={payBankAmount}
                            onChange={(e) => setPayBankAmount(e.target.value)}
                            className="w-full sm:flex-1 min-w-0 bg-gray-900 border border-gray-600 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-red-500 outline-none transition"
                        />
                        <button
                            onClick={handlePayBank}
                            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 px-6 py-2.5 rounded-lg font-semibold transition shadow-lg shadow-red-600/20 whitespace-nowrap"
                        >
                            Pay
                        </button>
                    </div>
                </div>

                {/* Pay Player (Player -> Player) */}
                <div className="bg-indigo-900/20 border border-indigo-700/50 p-5 rounded-xl flex flex-col">
                    <h3 className="text-lg font-semibold text-indigo-400 mb-4 flex items-center gap-2">
                        <span>🤝</span> Pay Player
                    </h3>
                    <p className="text-xs text-gray-400 mb-4">Send money to another player (e.g., for rent).</p>

                    <select
                        value={selectedPlayerId}
                        onChange={(e) => setSelectedPlayerId(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2.5 mb-3 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    >
                        <option value="">Select Player...</option>
                        {otherPlayers.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>

                    <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                        <input
                            type="number"
                            min="0"
                            placeholder="Amount ($)"
                            value={payPlayerAmount}
                            onChange={(e) => setPayPlayerAmount(e.target.value)}
                            className="w-full sm:flex-1 min-w-0 bg-gray-900 border border-gray-600 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                            disabled={otherPlayers.length === 0}
                        />
                        <button
                            onClick={handlePayPlayer}
                            disabled={otherPlayers.length === 0}
                            className="w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-700 px-6 py-2.5 rounded-lg font-semibold transition shadow-lg shadow-indigo-600/20 whitespace-nowrap"
                        >
                            Send
                        </button>
                    </div>
                    {otherPlayers.length === 0 && (
                        <p className="text-xs text-gray-500 mt-2">No other players have joined yet.</p>
                    )}
                </div>

            </div>
        </div>
    );
}
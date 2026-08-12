import React, { useState } from 'react';

export default function Banker({ players, onPayPlayer, onCollectPlayer }) {
    const [payAmount, setPayAmount] = useState('');
    const [collectAmount, setCollectAmount] = useState('');
    const [selectedPayPlayer, setSelectedPayPlayer] = useState('');
    const [selectedCollectPlayer, setSelectedCollectPlayer] = useState('');

    const handlePay = () => {
        if (!selectedPayPlayer || !payAmount) return;
        onPayPlayer(selectedPayPlayer, Number(payAmount));
        setPayAmount('');
        setSelectedPayPlayer('');
    };

    const handleCollect = () => {
        if (!selectedCollectPlayer || !collectAmount) return;
        onCollectPlayer(selectedCollectPlayer, Number(collectAmount));
        setCollectAmount('');
        setSelectedCollectPlayer('');
    };

    return (
        <div className="bg-gray-800/50 border border-emerald-900/30 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-emerald-500/20 p-3 rounded-xl">
                    <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">Banker Controls</h2>
                    <p className="text-sm text-gray-400">Manage the bank's money and player funds.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Pay Player Section */}
                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-5">
                    <h3 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center gap-2">💰 Pay Player</h3>
                    <div className="space-y-3">
                        <select
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition"
                            value={selectedPayPlayer}
                            onChange={(e) => setSelectedPayPlayer(e.target.value)}
                        >
                            <option value="" disabled>Select a Player...</option>
                            {players.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                        </select>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="number"
                                placeholder="Amount ($)"
                                value={payAmount}
                                onChange={(e) => setPayAmount(e.target.value)}
                                className="flex-grow w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition"
                            />
                            <button onClick={handlePay} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-lg whitespace-nowrap">Distribute</button>
                        </div>
                    </div>
                </div>

                {/* Collect from Player Section */}
                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-5">
                    <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">💳 Collect from Player</h3>
                    <div className="space-y-3">
                        <select
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none transition"
                            value={selectedCollectPlayer}
                            onChange={(e) => setSelectedCollectPlayer(e.target.value)}
                        >
                            <option value="" disabled>Select a Player...</option>
                            {players.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                        </select>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="number"
                                placeholder="Amount ($)"
                                value={collectAmount}
                                onChange={(e) => setCollectAmount(e.target.value)}
                                className="flex-grow w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none transition"
                            />
                            <button onClick={handleCollect} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-lg whitespace-nowrap">Collect</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
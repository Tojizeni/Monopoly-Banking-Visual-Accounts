import React from 'react';

export default function PropertyManager({ properties, players, onBuyProperty, onTradeProperty, currentPlayerId, onMortgage, onUnmortgage }) {
    if (!properties || properties.length === 0) {
        return null;
    }

    const colorMap = {
        brown: 'bg-amber-800',
        lightblue: 'bg-sky-300',
        pink: 'bg-pink-400',
        orange: 'bg-orange-400',
        red: 'bg-red-500',
        yellow: 'bg-yellow-400',
        green: 'bg-green-500',
        darkblue: 'bg-blue-800',
        black: 'bg-gray-900 border border-gray-400',
        white: 'bg-gray-200 text-black'
    };

    // Agar currentPlayerId pass hua hai, toh ye PLAYER ka view hai
    if (currentPlayerId) {
        const myProps = properties.filter(p => String(p.ownerId) === String(currentPlayerId));
        const bankProps = properties.filter(p => !p.ownerId);
        const otherProps = properties.filter(p => p.ownerId && String(p.ownerId) !== String(currentPlayerId));

        const renderCard = (prop) => {
            const owner = players.find(p => String(p._id) === String(prop.ownerId));
            const isMortgaged = prop.mortgaged;

            return (
                <div key={prop._id} className={`p-4 rounded-xl border flex flex-col ${isMortgaged ? 'bg-red-900/20 border-red-700/50' : 'bg-gray-900/50 border-gray-700'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className={`w-4 h-4 rounded ${colorMap[prop.color] || 'bg-gray-500'} ${isMortgaged ? 'opacity-50' : ''}`}></span>
                        <span className="text-gray-400 text-xs font-mono">${prop.price}</span>
                    </div>
                    <span className="font-medium text-white text-sm mb-2">{prop.name}</span>

                    {isMortgaged && (
                        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded text-center font-medium mb-2">Mortgaged</span>
                    )}

                    {/* Agar ye property meri hai toh Trade aur Mortgage options dikhao */}
                    {owner && String(owner._id) === String(currentPlayerId) && (
                        <div className="mt-auto pt-2 space-y-2">
                            {!isMortgaged ? (
                                <>
                                    <select
                                        defaultValue=""
                                        onChange={(e) => {
                                            if (e.target.value) { onTradeProperty && onTradeProperty(prop._id, e.target.value); e.target.value = ""; }
                                        }}
                                        className="w-full text-xs bg-gray-800 border border-gray-600 rounded px-2 py-2 outline-none focus:ring-1 focus:ring-indigo-500"
                                    >
                                        <option value="" disabled>Trade to...</option>
                                        {players.filter(p => String(p._id) !== String(currentPlayerId)).map(p => (
                                            <option key={p._id} value={p._id}>{p.name}</option>
                                        ))}
                                    </select>
                                    {onMortgage && (
                                        <button onClick={() => onMortgage(prop._id)} className="w-full text-xs bg-yellow-600/80 hover:bg-yellow-600 text-white px-2 py-2 rounded font-medium">
                                            Mortgage (+${Math.floor(prop.price / 2)})
                                        </button>
                                    )}
                                </>
                            ) : (
                                onUnmortgage && (
                                    <button onClick={() => onUnmortgage(prop._id)} className="w-full text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-2 rounded font-medium">
                                        Repay Mortgage (-${Math.floor(prop.price / 2)})
                                    </button>
                                )
                            )}
                        </div>
                    )}
                </div>
            );
        };

        return (
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 shadow-xl mt-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <span className="bg-purple-500/20 text-purple-400 p-2 rounded-lg">🏠</span>
                    Property Portfolio
                </h2>

                {/* 1. My Properties */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-emerald-400 mb-3 border-b border-gray-700 pb-2">Your Properties ({myProps.length})</h3>
                    {myProps.length === 0 ? (
                        <p className="text-gray-500 text-sm italic">You don't own any properties yet.</p>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {myProps.map(renderCard)}
                        </div>
                    )}
                </div>

                {/* 2. Bank Properties */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-yellow-400 mb-3 border-b border-gray-700 pb-2">In Bank ({bankProps.length})</h3>
                    <div className="flex flex-wrap gap-2">
                        {bankProps.map(prop => (
                            <span key={prop._id} className="flex items-center gap-2 bg-gray-900/50 px-3 py-1 rounded-full border border-gray-700 text-sm text-gray-300">
                                <span className={`w-3 h-3 rounded-full ${colorMap[prop.color]}`}></span>
                                {prop.name} <span className="text-gray-500 text-xs">(${prop.price})</span>
                            </span>
                        ))}
                    </div>
                </div>

                {/* 3. Owned by Others */}
                {otherProps.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold text-indigo-400 mb-3 border-b border-gray-700 pb-2">Owned by Others ({otherProps.length})</h3>
                        <div className="flex flex-wrap gap-2">
                            {otherProps.map(prop => {
                                const owner = players.find(p => String(p._id) === String(prop.ownerId));
                                return (
                                    <span key={prop._id} className="flex items-center gap-2 bg-gray-900/50 px-3 py-1 rounded-full border border-gray-700 text-sm text-gray-300">
                                        <span className={`w-3 h-3 rounded-full ${colorMap[prop.color]}`}></span>
                                        {prop.name} <span className="text-gray-500 text-xs">({owner?.name})</span>
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Agar currentPlayerId nahi hai, toh ye BANKER ka view hai (With Auction Support)
    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 shadow-xl mt-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="bg-purple-500/20 text-purple-400 p-2 rounded-lg">🏠</span>
                Property Manager
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2">
                {properties.map(prop => {
                    const owner = players.find(p => String(p._id) === String(prop.ownerId));

                    return (
                        <div key={prop._id} className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 flex flex-col">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className={`w-4 h-4 rounded ${colorMap[prop.color] || 'bg-gray-500'}`}></span>
                                    <span className="font-medium text-white text-sm">{prop.name}</span>
                                </div>
                                <span className="text-gray-400 text-xs font-mono">${prop.price}</span>
                            </div>

                            {!owner ? (
                                onBuyProperty ? (
                                    // Banker ko Sell/Auction ka form dikhao (Custom Price ke sath)
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            const formData = new FormData(e.target);
                                            const playerId = formData.get('player');
                                            const amount = Number(formData.get('price')) || prop.price;
                                            if (playerId) {
                                                onBuyProperty(prop._id, playerId, amount);
                                                e.target.reset();
                                            }
                                        }}
                                        className="flex flex-col gap-2"
                                    >
                                        <select
                                            name="player"
                                            required
                                            defaultValue=""
                                            className="w-full text-xs bg-gray-800 border border-gray-600 rounded px-2 py-2 outline-none focus:ring-1 focus:ring-emerald-500"
                                        >
                                            <option value="" disabled>Select Player...</option>
                                            {players.map(p => (<option key={p._id} value={p._id}>{p.name}</option>))}
                                        </select>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                name="price"
                                                defaultValue={prop.price}
                                                className="w-full text-xs bg-gray-800 border border-gray-600 rounded px-2 py-2 outline-none focus:ring-1 focus:ring-emerald-500"
                                                placeholder="Price"
                                            />
                                            <button
                                                type="submit"
                                                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 rounded font-medium whitespace-nowrap"
                                            >
                                                Sell
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <span className="text-xs bg-gray-700 text-gray-400 px-2 py-1 rounded text-center font-medium block">In Bank</span>
                                )
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-center font-medium">
                                        {owner.name}
                                    </span>
                                    {onTradeProperty && (
                                        <select
                                            defaultValue=""
                                            onChange={(e) => {
                                                if (e.target.value) { onTradeProperty(prop._id, e.target.value); e.target.value = ""; }
                                            }}
                                            className="w-full text-xs bg-gray-800 border border-gray-600 rounded px-2 py-2 outline-none focus:ring-1 focus:ring-indigo-500"
                                        >
                                            <option value="" disabled>Trade to...</option>
                                            {players.filter(p => String(p._id) !== String(owner._id)).map(p => (<option key={p._id} value={p._id}>{p.name}</option>))}
                                        </select>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
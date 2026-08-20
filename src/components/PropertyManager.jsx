import React from 'react';

export default function PropertyManager({ properties, players, onBuyProperty, onTradeProperty }) {
    if (!properties || properties.length === 0) {
        return null; // Agar properties na hoon toh kuch mat dikhao
    }

    // Properties ke colors ko Tailwind classes se map kar rahe hain
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

    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 shadow-xl mt-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="bg-purple-500/20 text-purple-400 p-2 rounded-lg">🏠</span>
                Property Manager
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2">
                {properties.map(prop => {
                    // Property ka malik dhoondo
                    const owner = players.find(p => p._id === prop.ownerId);

                    return (
                        <div key={prop._id} className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 flex flex-col">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className={`w-4 h-4 rounded ${colorMap[prop.color] || 'bg-gray-500'}`}></span>
                                    <span className="font-medium text-white text-sm">{prop.name}</span>
                                </div>
                                <span className="text-gray-400 text-xs font-mono">${prop.price}</span>
                            </div>

                            {/* Agar property Bank ki hai */}
                            {!owner ? (
                                onBuyProperty ? (
                                    // Banker ko dropdown dikhao
                                    <select
                                        defaultValue=""
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                onBuyProperty(prop._id, e.target.value);
                                                e.target.value = ""; // reset
                                            }
                                        }}
                                        className="w-full text-xs bg-gray-800 border border-gray-600 rounded px-2 py-2 outline-none focus:ring-1 focus:ring-emerald-500"
                                    >
                                        <option value="" disabled>Assign to Player...</option>
                                        {players.map(p => (
                                            <option key={p._id} value={p._id}>{p.name}</option>
                                        ))}
                                    </select>
                                ) : (
                                    // Player ko sirf text dikhao
                                    <span className="text-xs bg-gray-700 text-gray-400 px-2 py-1 rounded text-center font-medium block text-center">
                                        In Bank
                                    </span>
                                )
                            ) : (
                                /* Agar property kisi Player ki hai */
                                <div className="flex flex-col gap-2">
                                    <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-center font-medium">
                                        {owner.name}
                                    </span>

                                    {onTradeProperty && (
                                        // Sirf Banker ko Trade wala dropdown dikhao
                                        <select
                                            defaultValue=""
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    onTradeProperty(prop._id, e.target.value);
                                                    e.target.value = ""; // reset
                                                }
                                            }}
                                            className="w-full text-xs bg-gray-800 border border-gray-600 rounded px-2 py-2 outline-none focus:ring-1 focus:ring-indigo-500"
                                        >
                                            <option value="" disabled>Trade to...</option>
                                            {players.filter(p => p._id !== owner._id).map(p => (
                                                <option key={p._id} value={p._id}>{p.name}</option>
                                            ))}
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
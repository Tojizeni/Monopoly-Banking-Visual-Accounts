import React from 'react';

const HOUSE_COSTS = {
    brown: 50, lightblue: 50,
    pink: 100, orange: 100,
    red: 150, yellow: 150,
    green: 200, darkblue: 200,
};

export default function PropertyManager({ properties, players, onBuyProperty, onTradeProperty, currentPlayerId, onMortgage, onUnmortgage, onBuyHouse, onBuyHotel, onSellBuilding, onPayRent }) {
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

    const isStation = (p) => p.color === 'black';
    const isUtility = (p) => p.color === 'white';

    // ==================== PLAYER VIEW ====================
    if (currentPlayerId) {
        const myProps = properties.filter(p => String(p.ownerId) === String(currentPlayerId));
        const bankProps = properties.filter(p => !p.ownerId);
        const otherProps = properties.filter(p => p.ownerId && String(p.ownerId) !== String(currentPlayerId));

        // Kya player is property ka PURA color set own karta hai?
        const ownsFullSet = (prop) => {
            const group = properties.filter(p => p.color === prop.color);
            return group.length > 0 && group.every(p => String(p.ownerId) === String(currentPlayerId) && !p.mortgaged);
        };

        const handlePayRent = async (prop) => {
            let dice;
            if (isUtility(prop)) {
                const input = window.prompt(`Utility Rent! ${prop.name}\nDice roll value daalo (2-12):`);
                if (!input) return;
                dice = Number(input);
                if (!(dice >= 2 && dice <= 12)) { alert('Dice value 2-12 honi chahiye.'); return; }
            }
            try {
                const result = await onPayRent(prop._id, dice);
                alert(`Rent Paid: $${result.rent} -> ${result.ownerName} (${result.propertyName})`);
            } catch (err) {
                alert(err.message);
            }
        };

        const renderCard = (prop) => {
            const isMortgaged = prop.mortgaged;
            const houses = prop.houses || 0;
            const canBuild = ownsFullSet(prop) && !isStation(prop) && !isUtility(prop) && !isMortgaged;
            const houseCost = HOUSE_COSTS[prop.color] || 0;

            return (
                <div key={prop._id} className={`p-4 rounded-xl border flex flex-col ${isMortgaged ? 'bg-red-900/20 border-red-700/50' : 'bg-gray-900/50 border-gray-700'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className={`w-4 h-4 rounded ${colorMap[prop.color] || 'bg-gray-500'} ${isMortgaged ? 'opacity-50' : ''}`}></span>
                        <span className="text-gray-400 text-xs font-mono">${prop.price}</span>
                    </div>
                    <span className="font-medium text-white text-sm mb-1">{prop.name}</span>

                    {/* Houses / Hotel Display */}
                    {(houses > 0 || prop.hotel) && (
                        <div className="text-lg mb-2 text-center bg-gray-800/70 rounded py-1">
                            {prop.hotel ? '🏨 HOTEL' : '🏠'.repeat(houses)}
                        </div>
                    )}

                    {isMortgaged && (
                        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded text-center font-medium mb-2">Mortgaged</span>
                    )}

                    {/* Rent Details Table (collapsible) */}
                    {prop.rent && (
                        <details className="mb-2">
                            <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-300 select-none">▸ Rent Details</summary>
                            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] mt-2 bg-gray-800/50 rounded p-2 text-gray-300">
                                <span>Site: <b className="text-white">${prop.rent.site}</b></span>
                                <span>Full Set: <b className="text-white">${prop.rent.set}</b></span>
                                <span>1 🏠: <b className="text-white">${prop.rent.house1}</b></span>
                                <span>2 🏠: <b className="text-white">${prop.rent.house2}</b></span>
                                <span>3 🏠: <b className="text-white">${prop.rent.house3}</b></span>
                                <span>4 🏠: <b className="text-white">${prop.rent.house4}</b></span>
                                <span className="col-span-2">🏨 Hotel: <b className="text-yellow-400">${prop.rent.hotel}</b></span>
                                <span className="col-span-2 text-gray-500 border-t border-gray-700 pt-1">House cost: ${houseCost} each</span>
                            </div>
                        </details>
                    )}
                    {isStation(prop) && (
                        <p className="text-[11px] text-gray-500 mb-2">Rent: $25 / $50 / $100 / $200 (jitne stations malik ke paas hain)</p>
                    )}
                    {isUtility(prop) && (
                        <p className="text-[11px] text-gray-500 mb-2">Rent: 4x dice (1 utility) ya 10x dice (2 utilities)</p>
                    )}

                    {/* Build / Trade / Mortgage Buttons */}
                    <div className="mt-auto pt-2 space-y-2">
                        {canBuild && !prop.hotel && houses < 4 && (
                            <button onClick={() => onBuyHouse(prop._id)} className="w-full text-xs bg-orange-600 hover:bg-orange-700 text-white px-2 py-2 rounded font-medium">
                                🏠 Build House (-${houseCost})
                            </button>
                        )}
                        {canBuild && !prop.hotel && houses === 4 && (
                            <button onClick={() => onBuyHotel(prop._id)} className="w-full text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-2 rounded font-medium">
                                🏨 Build Hotel (-${houseCost})
                            </button>
                        )}
                        {(houses > 0 || prop.hotel) && onSellBuilding && (
                            <button onClick={() => onSellBuilding(prop._id)} className="w-full text-xs bg-gray-600 hover:bg-gray-500 text-white px-2 py-2 rounded font-medium">
                                💰 Sell Building (+${Math.floor(houseCost / 2)})
                            </button>
                        )}

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

                {/* 3. Owned by Others (Pay Rent Button ke sath) */}
                {otherProps.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold text-indigo-400 mb-3 border-b border-gray-700 pb-2">Owned by Others ({otherProps.length}) — jab kisi ki property par girein to Rent Pay karein</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {otherProps.map(prop => {
                                const owner = players.find(p => String(p._id) === String(prop.ownerId));
                                return (
                                    <div key={prop._id} className="flex items-center justify-between gap-2 bg-gray-900/50 px-3 py-2 rounded-lg border border-gray-700">
                                        <span className="flex items-center gap-2 text-sm text-gray-300 min-w-0">
                                            <span className={`w-3 h-3 rounded-full flex-shrink-0 ${colorMap[prop.color]}`}></span>
                                            <span className="truncate">{prop.name}</span>
                                            {prop.hotel ? '🏨' : (prop.houses ? '🏠'.repeat(prop.houses) : '')}
                                            <span className="text-gray-500 text-xs flex-shrink-0">({owner?.name}{prop.mortgaged ? ', 🔒' : ''})</span>
                                        </span>
                                        {!prop.mortgaged && onPayRent && (
                                            <button
                                                onClick={() => handlePayRent(prop)}
                                                className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded font-medium whitespace-nowrap flex-shrink-0"
                                            >
                                                Pay Rent
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ==================== BANKER VIEW ====================
    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 shadow-xl mt-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="bg-purple-500/20 text-purple-400 p-2 rounded-lg">🏠</span>
                Property Manager
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2">
                {properties.map(prop => {
                    const owner = players.find(p => String(p._id) === String(prop.ownerId));
                    const houses = prop.houses || 0;

                    return (
                        <div key={prop._id} className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 flex flex-col">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className={`w-4 h-4 rounded ${colorMap[prop.color] || 'bg-gray-500'}`}></span>
                                    <span className="font-medium text-white text-sm">{prop.name}</span>
                                </div>
                                <span className="text-gray-400 text-xs font-mono">${prop.price}</span>
                            </div>

                            {(houses > 0 || prop.hotel) && (
                                <div className="text-sm text-center bg-gray-800/70 rounded py-1 mb-2">
                                    {prop.hotel ? '🏨 HOTEL' : '🏠'.repeat(houses)}
                                </div>
                            )}
                            {prop.mortgaged && (
                                <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded text-center font-medium mb-2">Mortgaged</span>
                            )}

                            {!owner ? (
                                onBuyProperty ? (
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
                                        <select name="player" required defaultValue="" className="w-full text-xs bg-gray-800 border border-gray-600 rounded px-2 py-2 outline-none focus:ring-1 focus:ring-emerald-500">
                                            <option value="" disabled>Select Player...</option>
                                            {players.map(p => (<option key={p._id} value={p._id}>{p.name}</option>))}
                                        </select>
                                        <div className="flex gap-2">
                                            <input type="number" name="price" defaultValue={prop.price} className="w-full text-xs bg-gray-800 border border-gray-600 rounded px-2 py-2 outline-none focus:ring-1 focus:ring-emerald-500" placeholder="Price" />
                                            <button type="submit" className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 rounded font-medium whitespace-nowrap">Sell</button>
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
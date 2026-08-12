import React from 'react';

export default function TransactionHistory({ transactions }) {
    const safeTransactions = transactions || [];

    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5 shadow-xl h-full">
            <h3 className="text-lg font-bold text-white border-b border-gray-700 pb-3 mb-4">
                History
            </h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {safeTransactions.map(tx => (
                    <div key={tx._id} className="text-sm bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-gray-300">{tx.from} → {tx.to}</span>
                            <span className="font-mono font-bold text-emerald-400">${tx.amount}</span>
                        </div>
                        <p className="text-xs text-gray-500">{new Date(tx.timestamp).toLocaleTimeString()}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
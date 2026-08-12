import React, { useState } from 'react'; // useState import karo
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import PlayerList from '../components/PlayerList';
import Banker from '../components/Banker';
import TransactionHistory from '../components/TransactionHistory';

export default function RoomBanker() {
    const { id } = useParams();
    const roomId = id;
    const navigate = useNavigate();

    // 1. Hooks sabse pehle declare hone chahiye (Rules of Hooks)
    const gameState = useQuery(api.game.getRoomState, { roomId: roomId });
    const bankerPay = useMutation(api.game.bankerPayPlayer);
    const bankerCollect = useMutation(api.game.bankerCollectPlayer);
    const deleteRoom = useMutation(api.game.deleteRoom);

    // isLeaving state bhi yahan upar honi chahiye
    const [isLeaving, setIsLeaving] = useState(false);

    // Agar room delete ho jaye ya data na mile
    if (!gameState || !gameState.room) {
        return (
            <div className="p-8 text-center text-gray-400 min-h-screen flex flex-col items-center justify-center">
                <p>Room closed or loading...</p>
                <button onClick={() => navigate('/')} className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-lg">Go Home</button>
            </div>
        );
    }

    const handleLeaveRoom = async () => {
        if (isLeaving) return;
        setIsLeaving(true);
        try {
            await deleteRoom({ roomId: roomId });
            localStorage.removeItem('playerId');
            navigate('/');
        } catch (err) {
            console.error("Error leaving room:", err);
            setIsLeaving(false);
        }
    };

    return (
        <div className="flex-grow p-4 sm:p-6 max-w-7xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-gray-700">
                <div>
                    <h1 className="text-2xl font-bold text-emerald-400">Banker Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Room Code: <span className="font-mono text-lg text-white bg-gray-800 px-3 py-1 rounded-md tracking-widest font-bold">{gameState.room?.code}</span>
                    </p>
                </div>
                <button
                    onClick={handleLeaveRoom}
                    disabled={isLeaving}
                    className="mt-3 sm:mt-0 text-sm bg-red-600 hover:bg-red-700 text-white border border-red-600 px-4 py-2 rounded-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLeaving ? 'Closing...' : 'Close & Leave Room'}
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-1/4 min-w-0">
                    <PlayerList players={gameState.players} bankBalance={gameState.room?.bankBalance} />
                </div>
                <div className="lg:w-2/4 min-w-0">
                    <Banker
                        players={gameState.players}
                        onPayPlayer={(playerId, amount) => bankerPay({ playerId, amount })}
                        onCollectPlayer={(playerId, amount) => bankerCollect({ playerId, amount })}
                    />
                </div>
                <div className="lg:w-1/4 min-w-0">
                    <TransactionHistory transactions={gameState.transactions} />
                </div>
            </div>
        </div>
    );
}
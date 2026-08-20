import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import PlayerList from '../components/PlayerList';
import Player from '../components/Player';
import TransactionHistory from '../components/TransactionHistory';
import PropertyManager from '../components/PropertyManager'; // 1. YEH IMPORT ADD KIYA HAI

export default function RoomPlayer() {
    const { id } = useParams();
    const roomId = id;
    const leaveRoom = useMutation(api.game.leaveRoom);
    const navigate = useNavigate();

    // 1. Convex se live data lo
    const gameState = useQuery(api.game.getRoomState, { roomId: roomId });

    // Ye lines pehle se hongi
    const payBankMutation = useMutation(api.game.playerPayBank);
    const payPlayerMutation = useMutation(api.game.playerPayPlayer);

    // YE 3 LINES ADD KARO
    const tradePropMutation = useMutation(api.game.tradeProperty);
    const mortgagePropMutation = useMutation(api.game.mortgageProperty);
    const unmortgagePropMutation = useMutation(api.game.unmortgageProperty);

    // 3. Current player ka ID localStorage se lo
    const myPlayerId = localStorage.getItem('playerId');

    if (!gameState) {
        return <div className="p-8 text-center text-gray-400 min-h-screen flex items-center justify-center">Loading game...</div>;
    }

    // 4. Current player ko find karo
    const currentPlayer = gameState.players.find(p => p._id === myPlayerId);

    if (!currentPlayer) {
        return (
            <div className="flex-grow flex items-center justify-center p-6">
                <div className="text-center bg-gray-800/50 border border-gray-700 rounded-2xl p-10 max-w-md">
                    <h1 className="text-2xl font-bold text-white mb-2">Player Not Found</h1>
                    <p className="text-gray-400 mb-6">You haven't joined this room or your session expired.</p>
                    <Link to="/" className="text-indigo-400 hover:text-indigo-300 font-medium">Go Home</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-grow p-4 sm:p-6 max-w-7xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-gray-700">
                <div>
                    <h1 className="text-2xl font-bold text-indigo-400">Player Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Room Code: <span className="font-mono text-gray-400 bg-gray-800 px-2 py-0.5 rounded">{gameState.room?.code}</span>
                    </p>
                </div>
                <button
                    onClick={async () => {
                        await leaveRoom({ playerId: myPlayerId });
                        localStorage.removeItem('playerId');
                        navigate('/');
                    }}
                    className="mt-3 sm:mt-0 text-sm bg-red-600 hover:bg-red-700 text-white border border-red-600 px-4 py-2 rounded-lg transition cursor-pointer"
                >
                    Leave Room
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-1/4 min-w-0">
                    <PlayerList players={gameState.players} />
                </div>
                <div className="lg:w-2/4 min-w-0">
                    <Player
                        currentPlayer={currentPlayer}
                        players={gameState.players}
                        onPayBank={(playerId, amount) => payBankMutation({ playerId, amount })}
                        onPayPlayer={(fromId, toId, amount) => payPlayerMutation({ fromId, toId, amount })}
                    />
                </div>
                <div className="lg:w-1/4 min-w-0">
                    <TransactionHistory transactions={gameState.transactions} />
                </div>
            </div>

            {/* 2. YEH PROPERTY MANAGER COMPONENT ADD KIYA HAI */}
            <div className="mt-6">
                <PropertyManager
                    properties={gameState.properties}
                    players={gameState.players}
                    currentPlayerId={myPlayerId}
                    onTradeProperty={(propId, toPlayerId) => tradePropMutation({ propertyId: propId, toPlayerId })}
                    onMortgage={(propId) => mortgagePropMutation({ propertyId: propId })}
                    onUnmortgage={(propId) => unmortgagePropMutation({ propertyId: propId })}
                />
            </div>

        </div>
    );
}
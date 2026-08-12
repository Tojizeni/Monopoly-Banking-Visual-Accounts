import React from 'react';
import PlayerList from '../components/PlayerList';
import Banker from '../components/Banker';
import Player from '../components/Player';
import TransactionHistory from '../components/TransactionHistory';

export default function Room() {
    // Dummy state to determine if user is Banker or Player
    const isBanker = true;

    return (
        <div className="flex-grow p-4 sm:p-6 max-w-7xl mx-auto w-full">
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Sidebar: Player List */}
                <div className="lg:w-1/4">
                    <PlayerList />
                </div>

                {/* Main Content: Banker or Player View */}
                <div className="lg:w-2/4">
                    {isBanker ? <Banker /> : <Player />}
                </div>

                {/* Right Sidebar: Transaction History */}
                <div className="lg:w-1/4">
                    <TransactionHistory />
                </div>
            </div>
        </div>
    );
}
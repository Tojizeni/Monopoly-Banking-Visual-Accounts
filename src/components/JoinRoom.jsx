import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

export default function JoinRoom() {
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Convex backend ka function
    const joinRoom = useMutation(api.game.joinRoom);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // 1. Backend ko bulo aur room join karo
            const { playerId, roomId } = await joinRoom({ code, name });

            // YE LINE ADD KARNI HAI - Taaki player ka ID save ho jaye
            localStorage.setItem('playerId', playerId);

            // 2. Player dashboard pe redirect karo
            navigate(`/room/${roomId}/player`);
        } catch (err) {
            // Agar code galat hai toh ye error dikhao
            setError(err.message);
        }
    };

    return (
        <div className="flex-grow flex items-center justify-center p-4 sm:p-8">
            <div className="w-full max-w-md">
                <button onClick={() => navigate('/')} className="mb-6 text-gray-400 hover:text-white flex items-center gap-2 transition-colors group">
                    <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to Home
                </button>
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-xl">
                    <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                        <span className="bg-indigo-500/20 text-indigo-400 p-2 rounded-lg">🎮</span>
                        Join a Room
                    </h2>

                    {/* Agar error aaye toh yahan dikhega */}
                    {error && <p className="text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2 mb-4 text-sm">{error}</p>}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Your Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your name"
                                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Room Code</label>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                placeholder="Enter 4-digit code (e.g. ABCD)"
                                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 tracking-widest uppercase focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-lg shadow-indigo-600/20"
                        >
                            Join Game
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
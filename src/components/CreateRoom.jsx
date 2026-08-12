import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

export default function CreateRoom() {
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const createRoom = useMutation(api.game.createRoom);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            console.log("Creating room..."); // Ye console mein dikhega
            const result = await createRoom({ name });
            console.log("Room created:", result); // Agar ye aaya matlab backend theek hai

            navigate(`/room/${result.roomId}/banker`);
        } catch (err) {
            console.error("Error creating room:", err);
            setError(err.message); // Ye screen par error dikhayega
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
                        <span className="bg-emerald-500/20 text-emerald-400 p-2 rounded-lg">💼</span>
                        Create a Room
                    </h2>

                    {/* Agar koi error aaye toh yahan dikhega */}
                    {error && <p className="text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2 mb-4 text-sm">{error}</p>}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Your Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your name"
                                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-lg shadow-emerald-600/20"
                        >
                            Create Game Room
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
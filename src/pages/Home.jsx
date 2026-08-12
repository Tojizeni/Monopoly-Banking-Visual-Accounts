import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <div className="flex-grow flex flex-col items-center justify-center p-4 sm:p-8">
            <div className="text-center mb-12">
                <h1 className="text-5xl sm:text-6xl font-extrabold text-emerald-400 tracking-tight drop-shadow-lg">
                    Monopoly Banker
                </h1>
                <p className="mt-4 text-gray-400 text-xl">
                    Manage your game finances seamlessly.
                </p>
            </div>

            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Create Room Link Card */}
                <Link
                    to="/create"
                    className="group bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-10 shadow-xl hover:border-emerald-500 hover:bg-gray-800 transition-all duration-300 flex flex-col items-center text-center"
                >
                    <div className="bg-emerald-500/20 text-emerald-400 p-5 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-3">Create a Room</h2>
                    <p className="text-gray-400 text-lg">Start a new game and invite your friends to join.</p>
                </Link>

                {/* Join Room Link Card */}
                <Link
                    to="/join"
                    className="group bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-10 shadow-xl hover:border-indigo-500 hover:bg-gray-800 transition-all duration-300 flex flex-col items-center text-center"
                >
                    <div className="bg-indigo-500/20 text-indigo-400 p-5 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-3">Join a Room</h2>
                    <p className="text-gray-400 text-lg">Enter a room code to join an existing game.</p>
                </Link>
            </div>
        </div>
    );
}
// src/screens/RecordsScreen.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const RecordsScreen: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-32">
            {/* Header */}
            <header className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center transition-transform active:scale-90 shadow-sm border border-gray-100 dark:border-gray-700"
                    >
                        <span className="material-icons-round text-primary text-2xl">arrow_back</span>
                    </button>
                    <h1 className="text-xl font-black text-gray-900 dark:text-white">Medical Records</h1>
                </div>
            </header>

            {/* Main Content */}
            <div className="px-6 mt-6 space-y-4">
                {/* Recent Records Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Records</h2>
                        <button className="text-sm font-medium text-primary">View All</button>
                    </div>

                    <div className="space-y-4">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <span className="material-icons-round text-blue-500 dark:text-blue-400">description</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Medical Report {item}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Dec {25 - item}, 2023 • PDF</p>
                                </div>
                                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                    <span className="material-icons-round">more_vert</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Categories */}
                <div className="mt-8">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Categories</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { icon: 'description', label: 'Reports', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
                            { icon: 'local_hospital', label: 'Prescriptions', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
                            { icon: 'receipt', label: 'Bills', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
                            { icon: 'science', label: 'Lab Tests', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' }
                        ].map((category, index) => (
                            <div
                                key={index}
                                className="p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center aspect-square"
                            >
                                <div className={`w-12 h-12 rounded-xl ${category.color} flex items-center justify-center mb-2`}>
                                    <span className="material-icons-round text-2xl">{category.icon}</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{category.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecordsScreen;
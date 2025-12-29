// src/screens/LabtestScreen.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LAB_TESTS, TEST_CATEGORIES } from '../resources/LabTest';

const LabtestScreen: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const filteredTests = LAB_TESTS.filter(test => {
        const matchesCategory =
            activeCategory === 'all' ||
            (activeCategory === 'popular' ? test.popular : test.category.toLowerCase() === activeCategory);
        const matchesSearch = test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            test.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

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
                    <h1 className="text-xl font-black text-gray-900 dark:text-white">Lab Tests</h1>
                </div>
            </header>

            {/* Search Bar */}
            <div className="px-6 mt-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search tests..."
                        className="w-full bg-white dark:bg-gray-800 border-none rounded-2xl py-4 pl-12 pr-4 text-sm shadow-sm focus:ring-2 focus:ring-primary transition-all dark:text-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <span className="material-icons-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                </div>
            </div>

            {/* Categories */}
            <div className="px-6 mt-6">
                <div className="flex space-x-2 overflow-x-auto pb-2 hide-scrollbar">
                    {TEST_CATEGORIES.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setActiveCategory(category.id)}
                            className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                                activeCategory === category.id
                                    ? 'bg-primary text-white shadow-primary/30'
                                    : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700'
                            }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Test List */}
            <div className="px-6 mt-6 space-y-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {activeCategory === 'all'
                        ? 'All Tests'
                        : activeCategory === 'popular'
                            ? 'Popular Tests'
                            : `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Tests`}
                </h2>

                {filteredTests.length > 0 ? (
                    filteredTests.map((test) => (
                        <div
                            key={test.id}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-base font-bold text-gray-900 dark:text-white">{test.name}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{test.category}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-primary">₹{test.price}</p>
                                    <p className="text-[10px] text-gray-400 mt-1">{test.resultsIn}</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-3">{test.description}</p>
                            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    <span className="font-medium">Preparation:</span> {test.preparation}
                                </p>
                            </div>
                            <button className="w-full mt-4 bg-primary hover:bg-primary-dark text-white py-2.5 rounded-xl text-sm font-medium transition-colors">
                                Book Now
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10">
                        <p className="text-gray-500 dark:text-gray-400">No tests found matching your criteria</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LabtestScreen;
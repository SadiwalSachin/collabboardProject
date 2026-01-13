import React, { useState } from 'react';
import {
    LuLayout,
    LuUsers,
    LuClock,
    LuSettings,
    LuSearch,
    LuChevronDown,
    LuPlus,
    LuLayoutDashboard,
    LuMenu,
    LuX
} from 'react-icons/lu';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const SidebarItem = ({ icon: Icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${active
            ? 'bg-blue-50 text-blue-600'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}>
        <Icon size={20} />
        {label}
    </button>
);

const BoardCard = ({ title, lastEdited, owner, image, roomId, isNew = false }: {
    title: string,
    lastEdited?: string,
    owner?: string,
    image?: string,
    roomId?: string,
    isNew?: boolean
}) => {
    const navigate = useNavigate();

    if (isNew) {
        return (
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/${uuidv4()}`)}
                className="group relative flex flex-col gap-3"
            >
                <div className="aspect-[4/3] w-full border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400 group-hover:border-blue-400 group-hover:text-blue-500 transition-colors">
                    <LuPlus size={40} />
                </div>
                <div className="text-left px-1">
                    <h3 className="font-semibold text-gray-900 text-sm md:text-base">New Board</h3>
                </div>
            </motion.button>
        );
    }

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate(`/${roomId || uuidv4()}`)}
            className="group cursor-pointer flex flex-col gap-3"
        >
            <div className="aspect-[4/3] w-full rounded-xl overflow-hidden border border-gray-100 shadow-sm relative">
                <img src={image} alt={title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="px-1">
                <h3 className="font-semibold text-gray-900 mb-0.5 text-sm md:text-base truncate">{title}</h3>
                <p className="text-[10px] md:text-xs text-gray-500">Last edited: {lastEdited}</p>
                <p className="text-[10px] md:text-xs text-gray-400 font-medium">Owner: {owner}</p>
            </div>
        </motion.div>
    );
};

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const boards = [
        { title: "Q3 Project Brainstorm", lastEdited: "2 hours ago", owner: "You", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60", roomId: "q3-brainstorm" },
        { title: "Website Redesign", lastEdited: "1 day ago", owner: "You", image: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=60", roomId: "web-redesign" },
        { title: "Mobile App Launch", lastEdited: "3 days ago", owner: "Phoenix Baker", image: "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&auto=format&fit=crop&q=60", roomId: "app-launch" },
        { title: "Marketing Campaign", lastEdited: "5 days ago", owner: "You", image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&auto=format&fit=crop&q=60", roomId: "marketing" },
        { title: "User Research", lastEdited: "1 week ago", owner: "Candice Wu", image: "https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=60", roomId: "user-research" },
        { title: "2024 Planning", lastEdited: "2 weeks ago", owner: "You", image: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800&auto=format&fit=crop&q=60", roomId: "planning-24" },
        { title: "Competitor Analysis", lastEdited: "1 month ago", owner: "Lana Steiner", image: "https://images.unsplash.com/photo-1522441815192-d9f04eb0615c?w=800&auto=format&fit=crop&q=60", roomId: "comp-analysis" },
    ];

    const SidebarContent = () => (
        <>
            <div
                className="flex items-center justify-between px-2 mb-8 cursor-pointer"
                onClick={() => navigate("/")}
            >
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                        <LuLayoutDashboard size={20} />
                    </div>
                    <span className="font-bold text-xl text-gray-900">Boardify</span>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); setIsSidebarOpen(false); }}
                    className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                >
                    <LuX size={20} />
                </button>
            </div>

            <nav className="flex-1 flex flex-col gap-1">
                <SidebarItem icon={LuLayout} label="My Boards" active />
                <SidebarItem icon={LuUsers} label="Shared with Me" />
                <SidebarItem icon={LuClock} label="Recent" />
            </nav>

            <div className="mt-auto pt-4 border-t border-gray-50 flex flex-col gap-1">
                <SidebarItem icon={LuSettings} label="Settings" />
                <div className="flex items-center gap-3 px-4 py-4 mt-2 bg-gray-50/50 rounded-xl">
                    <img
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60"
                        alt="Profile"
                        className="w-10 h-10 rounded-full border border-gray-100"
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">Olivia Rhye</p>
                        <p className="text-[10px] text-gray-500 truncate">olivia@untitledui.com</p>
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <div className="flex min-h-screen bg-white font-sans relative">
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[40] md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 bg-white border-r border-gray-100 p-4 z-[50] w-64 transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0 md:static
            `}>
                <SidebarContent />
            </aside>

            {/* Main Content */}
            <main className="flex-1 bg-gray-50/30 min-w-0 overflow-x-hidden">
                <div className="max-w-7xl mx-auto p-4 md:p-8">
                    {/* Header */}
                    <header className="flex flex-col gap-6 mb-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                                >
                                    <LuMenu size={24} />
                                </button>
                                <h1 className="text-xl md:text-2xl font-bold text-gray-900">My Boards</h1>
                            </div>

                            <button
                                onClick={() => navigate(`/${uuidv4()}`)}
                                className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
                            >
                                <LuPlus size={18} />
                                <span className="hidden sm:inline">New Board</span>
                                <span className="sm:hidden text-xs">New</span>
                            </button>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            {/* Search */}
                            <div className="relative flex-1 group">
                                <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search boards..."
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                                />
                            </div>

                            {/* Sort */}
                            <button className="flex items-center justify-between gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm whitespace-nowrap">
                                <span className="text-xs md:text-sm">Sort: Last Edited</span>
                                <LuChevronDown size={14} className="text-gray-400" />
                            </button>
                        </div>
                    </header>

                    {/* Boards Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
                        <BoardCard title="New Board" isNew />
                        {boards.map((board, index) => (
                            <BoardCard key={index} {...board} />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;



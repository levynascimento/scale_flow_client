import { Outlet, NavLink, useParams } from 'react-router-dom'
import { useState } from 'react'
import {
    Home, Music, Calendar, Users, Layers,
    ChevronLeft, ChevronRight, LogOut, Cloud
} from 'lucide-react'
import { logoutUser } from '../../utils/authUtils'

export default function BandLayout() {
    const { id } = useParams()
    const [collapsed, setCollapsed] = useState(false)

    const role = localStorage.getItem("bandRole")
    const isAdmin = role === "ADMIN"

    return (
        <div className="flex min-h-screen bg-[#0f0f10] text-gray-100">

            {/* Sidebar */}
            <aside
                className={`${collapsed ? 'w-16' : 'w-56'}
                bg-[#1b1b1f] border-r border-[#2a2a30] flex flex-col transition-all duration-200`}
            >
                {/* Logo + collapse */}
                <div className="flex items-center justify-between px-4 py-4 border-b border-[#2a2a30]">
                    {!collapsed && (
                        <h1 className="text-lg font-semibold text-[#7c5fff]">ScaleFlow</h1>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="text-gray-400 hover:text-white text-sm"
                    >
                        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                </div>

                {/* Menu */}
                <nav className="flex-1 px-3 py-4 space-y-2">

                    {/* Home */}
                    <NavLink
                        to={`/bands/${id}/home`}
                        end
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${
                                isActive
                                    ? 'bg-[#7c5fff] text-white'
                                    : 'text-gray-300 hover:bg-[#2a2a2f]'
                            }`}
                    >
                        <Home size={18} />
                        {!collapsed && 'Home'}
                    </NavLink>

                    {/* Repertórios */}
                    <NavLink
                        to={`/bands/${id}/repertoires`}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${
                                isActive
                                    ? 'bg-[#7c5fff] text-white'
                                    : 'text-gray-300 hover:bg-[#2a2a2f]'
                            }`}
                    >
                        <Music size={18} />
                        {!collapsed && 'Repertório'}
                    </NavLink>

                    {/* Eventos */}
                    <NavLink
                        to={`/bands/${id}/events`}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${
                                isActive
                                    ? 'bg-[#7c5fff] text-white'
                                    : 'text-gray-300 hover:bg-[#2a2a2f]'
                            }`}
                    >
                        <Calendar size={18} />
                        {!collapsed && 'Eventos'}
                    </NavLink>

                    {/* Papéis */}
                    <NavLink
                        to={`/bands/${id}/roles`}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${
                                isActive
                                    ? 'bg-[#7c5fff] text-white'
                                    : 'text-gray-300 hover:bg-[#2a2a2f]'
                            }`}
                    >
                        <Users size={18} />
                        {!collapsed && 'Papéis'}
                    </NavLink>

                    {/* Formações */}
                    <NavLink
                        to={`/bands/${id}/lineups`}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${
                                isActive
                                    ? 'bg-[#7c5fff] text-white'
                                    : 'text-gray-300 hover:bg-[#2a2a2f]'
                            }`}
                    >
                        <Layers size={18} />
                        {!collapsed && 'Formações'}
                    </NavLink>

                    {/* ⭐ HOLYRICS — Apenas ADM */}
                    {isAdmin && (
                        <NavLink
                            to={`/bands/${id}/holyrics`}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${
                                    isActive
                                        ? 'bg-[#7c5fff] text-white'
                                        : 'text-gray-300 hover:bg-[#2a2a2f]'
                                }`}
                        >
                            <Cloud size={18} />
                            {!collapsed && 'Holyrics'}
                        </NavLink>
                    )}
                </nav>
            </aside>

            {/* Conteúdo */}
            <main className="flex-1 flex flex-col">
                <header className="bg-[#1b1b1f] border-b border-[#2a2a30] p-4 flex justify-between items-center shadow-sm">
                    <h2 className="text-lg font-medium text-gray-200">Painel da Banda</h2>
                    <button
                        onClick={logoutUser}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                    >
                        <LogOut size={16} />
                        <span className="hidden sm:inline">Sair</span>
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-6 bg-[#0f0f10]">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}

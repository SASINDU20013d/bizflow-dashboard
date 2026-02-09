import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import {
    LayoutDashboard,
    Users,
    FolderKanban,
    Wallet,
    CreditCard,
    Menu,
    X,
    Sparkles
} from 'lucide-react'

const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/customers', icon: Users, label: 'Customers' },
    { path: '/projects', icon: FolderKanban, label: 'Projects' },
    { path: '/finance', icon: Wallet, label: 'Finance' },
    { path: '/subscriptions', icon: CreditCard, label: 'Subscriptions' },
]

export default function Layout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    return (
        <div className="min-h-screen flex">
            {/* Mobile overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 glass-card rounded-none lg:rounded-r-3xl
        transform transition-transform duration-300 ease-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <div className="p-6 h-full flex flex-col">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center animate-glow">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold gradient-text">BizFlow</h1>
                            <p className="text-xs text-dark-400">Business Dashboard</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-2">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === '/'}
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                onClick={() => setIsSidebarOpen(false)}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>

                    {/* Footer */}
                    <div className="pt-6 border-t border-dark-600/50">
                        <div className="glass-card p-4 bg-gradient-to-br from-primary-500/10 to-accent-500/10">
                            <p className="text-sm text-dark-300">💡 Tip: Use search to quickly find customers</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
                {/* Top Bar */}
                <header className="sticky top-0 z-30 glass-card rounded-none border-x-0 border-t-0 px-4 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            className="lg:hidden p-2 rounded-xl hover:bg-dark-700/50 transition-colors"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        >
                            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                        <div className="flex-1 lg:flex-none" />
                        <div className="text-sm text-dark-400">
                            {new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-4 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}

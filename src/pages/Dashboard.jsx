import { useState, useEffect } from 'react'
import {
    TrendingUp,
    TrendingDown,
    Users,
    FolderKanban,
    Clock,
    DollarSign,
    AlertCircle,
    CheckCircle2,
    ArrowUpRight
} from 'lucide-react'
import { Link } from 'react-router-dom'

// Mock data - will be replaced with Google Sheets API
const mockStats = {
    totalIncome: 125000,
    pendingPayments: 45000,
    activeProjects: 12,
    completedProjects: 48,
    totalCustomers: 24,
    upcomingDeadlines: 5,
    monthlySubscriptions: 2500
}

const mockRecentProjects = [
    { id: 1, customer: 'John Doe', type: 'Research Report', deadline: '2026-02-15', status: 'pending', amount: 5000 },
    { id: 2, customer: 'Jane Smith', type: 'Assignment', deadline: '2026-02-12', status: 'progress', amount: 3500 },
    { id: 3, customer: 'Mike Johnson', type: 'University Project', deadline: '2026-02-20', status: 'progress', amount: 8000 },
    { id: 4, customer: 'Sara Williams', type: 'Research Report', deadline: '2026-02-10', status: 'completed', amount: 6500 },
]

const mockUpcomingRenewals = [
    { name: 'ChatGPT Plus', date: '2026-02-15', cost: 20 },
    { name: 'Claude Pro', date: '2026-02-20', cost: 20 },
    { name: 'Humanizer Tool', date: '2026-03-01', cost: 15 },
]

function StatCard({ icon: Icon, label, value, trend, trendUp, color }) {
    return (
        <div className="stat-card group">
            <div className="flex items-start justify-between">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-sm ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
                        {trendUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        <span>{trend}</span>
                    </div>
                )}
            </div>
            <div className="mt-4">
                <p className="text-2xl lg:text-3xl font-bold text-white">{value}</p>
                <p className="text-sm text-dark-400 mt-1">{label}</p>
            </div>
        </div>
    )
}

function getStatusBadge(status) {
    const badges = {
        pending: 'badge-pending',
        progress: 'badge-progress',
        completed: 'badge-completed'
    }
    const labels = {
        pending: 'Pending',
        progress: 'In Progress',
        completed: 'Completed'
    }
    return <span className={`badge ${badges[status]}`}>{labels[status]}</span>
}

export default function Dashboard() {
    const [stats, setStats] = useState(mockStats)
    const [recentProjects, setRecentProjects] = useState(mockRecentProjects)
    const [renewals, setRenewals] = useState(mockUpcomingRenewals)

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl lg:text-4xl font-bold gradient-text">Dashboard</h1>
                <p className="text-dark-400 mt-2">Welcome back! Here's your business overview.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <StatCard
                    icon={DollarSign}
                    label="Total Income"
                    value={`Rs. ${stats.totalIncome.toLocaleString()}`}
                    trend="+12%"
                    trendUp={true}
                    color="from-green-500 to-emerald-600"
                />
                <StatCard
                    icon={Clock}
                    label="Pending Payments"
                    value={`Rs. ${stats.pendingPayments.toLocaleString()}`}
                    color="from-yellow-500 to-orange-500"
                />
                <StatCard
                    icon={FolderKanban}
                    label="Active Projects"
                    value={stats.activeProjects}
                    color="from-primary-500 to-primary-600"
                />
                <StatCard
                    icon={Users}
                    label="Total Customers"
                    value={stats.totalCustomers}
                    trend="+3"
                    trendUp={true}
                    color="from-accent-500 to-accent-600"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Projects */}
                <div className="lg:col-span-2 glass-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-white">Recent Projects</h2>
                        <Link to="/projects" className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1 transition-colors">
                            View All <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {recentProjects.map((project) => (
                            <div key={project.id} className="flex items-center justify-between p-4 rounded-xl bg-dark-700/50 hover:bg-dark-700 transition-colors">
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-white truncate">{project.customer}</p>
                                    <p className="text-sm text-dark-400">{project.type}</p>
                                </div>
                                <div className="hidden sm:block text-center px-4">
                                    <p className="text-sm text-dark-300">{new Date(project.deadline).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    {getStatusBadge(project.status)}
                                    <p className="text-white font-medium hidden sm:block">Rs. {project.amount.toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Upcoming Deadlines Alert */}
                    <div className="glass-card p-6 border-l-4 border-yellow-500">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertCircle className="w-5 h-5 text-yellow-500" />
                            <h3 className="font-semibold text-white">Upcoming Deadlines</h3>
                        </div>
                        <p className="text-3xl font-bold text-yellow-400">{stats.upcomingDeadlines}</p>
                        <p className="text-sm text-dark-400 mt-1">projects due this week</p>
                    </div>

                    {/* Subscription Renewals */}
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-white">Subscription Renewals</h3>
                            <Link to="/subscriptions" className="text-primary-400 hover:text-primary-300 text-xs">
                                Manage
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {renewals.map((renewal, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-dark-700/50">
                                    <div>
                                        <p className="text-sm font-medium text-white">{renewal.name}</p>
                                        <p className="text-xs text-dark-400">{new Date(renewal.date).toLocaleDateString()}</p>
                                    </div>
                                    <p className="text-sm font-semibold text-accent-400">${renewal.cost}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="glass-card p-6 bg-gradient-to-br from-primary-500/10 to-accent-500/10">
                        <div className="flex items-center gap-3 mb-4">
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                            <h3 className="font-semibold text-white">Completed Projects</h3>
                        </div>
                        <p className="text-4xl font-bold text-green-400">{stats.completedProjects}</p>
                        <p className="text-sm text-dark-400 mt-1">all time</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

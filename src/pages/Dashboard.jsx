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
    ArrowUpRight,
    Loader2
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { getDashboardStats, getAll, SHEETS, isApiConfigured } from '../services/api'

// Fallback mock data (used when API is loading or unavailable)
const defaultStats = {
    totalIncome: 0,
    pendingPayments: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalCustomers: 0,
    upcomingDeadlines: 0,
    monthlySubscriptions: 0
}

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
    const statusLower = (status || '').toLowerCase().replace(' ', '')
    const badges = {
        pending: 'badge-pending',
        inprogress: 'badge-progress',
        progress: 'badge-progress',
        completed: 'badge-completed'
    }
    const labels = {
        pending: 'Pending',
        inprogress: 'In Progress',
        progress: 'In Progress',
        completed: 'Completed'
    }
    return <span className={`badge ${badges[statusLower] || 'badge-pending'}`}>{labels[statusLower] || status}</span>
}

export default function Dashboard() {
    const [stats, setStats] = useState(defaultStats)
    const [recentProjects, setRecentProjects] = useState([])
    const [renewals, setRenewals] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            try {
                // Fetch stats
                const statsData = await getDashboardStats()
                if (statsData) {
                    setStats(statsData)
                }

                // Fetch recent projects
                const projectsData = await getAll(SHEETS.PROJECTS)
                if (projectsData && Array.isArray(projectsData)) {
                    // Sort by deadline and take first 4
                    const sorted = projectsData
                        .sort((a, b) => new Date(a.Deadline) - new Date(b.Deadline))
                        .slice(0, 4)
                        .map(p => ({
                            id: p.id,
                            customer: p['Customer ID'] || 'Unknown',
                            type: p['Project Type'] || 'Project',
                            deadline: p.Deadline || '',
                            status: (p.Status || 'pending').toLowerCase().replace(' ', ''),
                            amount: parseFloat(p.Price) || 0
                        }))
                    setRecentProjects(sorted)
                }

                // Fetch subscriptions for renewals
                const subsData = await getAll(SHEETS.SUBSCRIPTIONS)
                if (subsData && Array.isArray(subsData)) {
                    const activeRenewals = subsData
                        .filter(s => s['Active?'] === true || s['Active?'] === 'TRUE' || s['Active?'] === 'Yes')
                        .map(s => ({
                            name: s['Service Name'] || 'Subscription',
                            date: s['Next Renewal Date'] || '',
                            cost: parseFloat(s.Cost) || 0
                        }))
                        .sort((a, b) => new Date(a.date) - new Date(b.date))
                        .slice(0, 3)
                    setRenewals(activeRenewals)
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
        )
    }

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
                    value={`Rs. ${(stats.totalIncome || 0).toLocaleString()}`}
                    color="from-green-500 to-emerald-600"
                />
                <StatCard
                    icon={Clock}
                    label="Pending Payments"
                    value={`Rs. ${(stats.pendingPayments || 0).toLocaleString()}`}
                    color="from-yellow-500 to-orange-500"
                />
                <StatCard
                    icon={FolderKanban}
                    label="Active Projects"
                    value={stats.activeProjects || 0}
                    color="from-primary-500 to-primary-600"
                />
                <StatCard
                    icon={Users}
                    label="Total Customers"
                    value={stats.totalCustomers || 0}
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
                        {recentProjects.length === 0 ? (
                            <p className="text-dark-400 text-center py-8">No projects yet. Add your first project!</p>
                        ) : (
                            recentProjects.map((project) => (
                                <div key={project.id} className="flex items-center justify-between p-4 rounded-xl bg-dark-700/50 hover:bg-dark-700 transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-white truncate">{project.customer}</p>
                                        <p className="text-sm text-dark-400">{project.type}</p>
                                    </div>
                                    <div className="hidden sm:block text-center px-4">
                                        <p className="text-sm text-dark-300">{project.deadline ? new Date(project.deadline).toLocaleDateString() : '-'}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {getStatusBadge(project.status)}
                                        <p className="text-white font-medium hidden sm:block">Rs. {project.amount.toLocaleString()}</p>
                                    </div>
                                </div>
                            ))
                        )}
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
                        <p className="text-3xl font-bold text-yellow-400">{stats.upcomingDeadlines || 0}</p>
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
                            {renewals.length === 0 ? (
                                <p className="text-dark-400 text-sm">No active subscriptions</p>
                            ) : (
                                renewals.map((renewal, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-dark-700/50">
                                        <div>
                                            <p className="text-sm font-medium text-white">{renewal.name}</p>
                                            <p className="text-xs text-dark-400">{renewal.date ? new Date(renewal.date).toLocaleDateString() : '-'}</p>
                                        </div>
                                        <p className="text-sm font-semibold text-accent-400">${renewal.cost}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="glass-card p-6 bg-gradient-to-br from-primary-500/10 to-accent-500/10">
                        <div className="flex items-center gap-3 mb-4">
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                            <h3 className="font-semibold text-white">Completed Projects</h3>
                        </div>
                        <p className="text-4xl font-bold text-green-400">{stats.completedProjects || 0}</p>
                        <p className="text-sm text-dark-400 mt-1">all time</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

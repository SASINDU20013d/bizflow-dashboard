import { useState, useEffect } from 'react'
import {
    Plus,
    CreditCard,
    Calendar,
    DollarSign,
    X,
    AlertCircle,
    CheckCircle2,
    Pause,
    Play,
    Trash2,
    Loader2
} from 'lucide-react'
import { getAll, addRecord, updateRecord, deleteRecord, SHEETS } from '../services/api'

const cycles = ['Monthly', 'Yearly']

function getDaysUntil(dateString) {
    if (!dateString) return 999
    const today = new Date()
    const target = new Date(dateString)
    const diffTime = target - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
}

export default function Subscriptions() {
    const [subscriptions, setSubscriptions] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingSub, setEditingSub] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        cost: '',
        cycle: 'Monthly',
        nextRenewal: '',
        active: true
    })

    useEffect(() => {
        fetchSubscriptions()
    }, [])

    async function fetchSubscriptions() {
        setLoading(true)
        try {
            const data = await getAll(SHEETS.SUBSCRIPTIONS)
            if (data && Array.isArray(data)) {
                const mapped = data.map(s => ({
                    id: s.id,
                    name: s['Service Name'] || '',
                    cost: parseFloat(s.Cost) || 0,
                    cycle: s.Cycle || 'Monthly',
                    nextRenewal: s['Next Renewal Date'] || '',
                    active: s['Active?'] === true || s['Active?'] === 'TRUE' || s['Active?'] === 'Yes'
                }))
                setSubscriptions(mapped)
            }
        } catch (error) {
            console.error('Error fetching subscriptions:', error)
        } finally {
            setLoading(false)
        }
    }

    const activeSubscriptions = subscriptions.filter(s => s.active)
    const monthlyTotal = activeSubscriptions.reduce((sum, s) => {
        return sum + (s.cycle === 'Yearly' ? s.cost / 12 : s.cost)
    }, 0)
    const yearlyTotal = monthlyTotal * 12

    const upcomingRenewals = activeSubscriptions.filter(s => getDaysUntil(s.nextRenewal) <= 7)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            const payload = {
                'Service Name': formData.name,
                'Cost': formData.cost,
                'Cycle': formData.cycle,
                'Next Renewal Date': formData.nextRenewal,
                'Active?': formData.active ? 'Yes' : 'No'
            }

            if (editingSub) {
                await updateRecord(SHEETS.SUBSCRIPTIONS, editingSub.id, payload)
            } else {
                await addRecord(SHEETS.SUBSCRIPTIONS, payload)
            }
            await fetchSubscriptions()
            closeModal()
        } catch (error) {
            console.error('Error saving subscription:', error)
            alert('Failed to save. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    const openModal = (sub = null) => {
        if (sub) {
            setEditingSub(sub)
            setFormData({
                name: sub.name,
                cost: sub.cost.toString(),
                cycle: sub.cycle,
                nextRenewal: sub.nextRenewal,
                active: sub.active
            })
        } else {
            setEditingSub(null)
            setFormData({
                name: '',
                cost: '',
                cycle: 'Monthly',
                nextRenewal: '',
                active: true
            })
        }
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingSub(null)
    }

    const toggleActive = async (sub) => {
        try {
            await updateRecord(SHEETS.SUBSCRIPTIONS, sub.id, { 'Active?': sub.active ? 'No' : 'Yes' })
            setSubscriptions(subscriptions.map(s => s.id === sub.id ? { ...s, active: !s.active } : s))
        } catch (error) {
            console.error('Error toggling subscription:', error)
        }
    }

    const deleteSub = async (sub) => {
        if (confirm(`Are you sure you want to delete ${sub.name}?`)) {
            try {
                await deleteRecord(SHEETS.SUBSCRIPTIONS, sub.id)
                await fetchSubscriptions()
            } catch (error) {
                console.error('Error deleting subscription:', error)
                alert('Failed to delete. Please try again.')
            }
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold gradient-text">Subscriptions</h1>
                    <p className="text-dark-400 mt-2">Manage your recurring payments and tools</p>
                </div>
                <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Add Subscription
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="stat-card">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600">
                            <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-dark-400">Active Subscriptions</p>
                            <p className="text-2xl font-bold text-white">{activeSubscriptions.length}</p>
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600">
                            <DollarSign className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-dark-400">Monthly Cost</p>
                            <p className="text-2xl font-bold text-accent-400">${monthlyTotal.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
                            <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-dark-400">Yearly Cost</p>
                            <p className="text-2xl font-bold text-green-400">${yearlyTotal.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upcoming Renewals Alert */}
            {upcomingRenewals.length > 0 && (
                <div className="glass-card p-4 border-l-4 border-yellow-500">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                        <div>
                            <p className="font-medium text-white">Upcoming Renewals</p>
                            <p className="text-sm text-dark-400">
                                {upcomingRenewals.map(s => s.name).join(', ')} due within 7 days
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Subscriptions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {subscriptions.map((sub) => {
                    const daysUntil = getDaysUntil(sub.nextRenewal)
                    const isUrgent = daysUntil <= 7 && sub.active

                    return (
                        <div
                            key={sub.id}
                            className={`glass-card-hover p-6 relative overflow-hidden ${!sub.active ? 'opacity-60' : ''}`}
                        >
                            {isUrgent && (
                                <div className="absolute top-0 right-0 px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded-bl-xl">
                                    Due in {daysUntil} days
                                </div>
                            )}

                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
                                    <CreditCard className="w-6 h-6 text-primary-400" />
                                </div>
                                <div className="flex items-center gap-1">
                                    {sub.active ? (
                                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                                    ) : (
                                        <Pause className="w-4 h-4 text-dark-400" />
                                    )}
                                </div>
                            </div>

                            <h3 className="text-lg font-semibold text-white mb-1">{sub.name}</h3>
                            <div className="flex items-baseline gap-1 mb-4">
                                <span className="text-2xl font-bold text-accent-400">${sub.cost}</span>
                                <span className="text-sm text-dark-400">/ {sub.cycle.toLowerCase()}</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-dark-400 mb-4">
                                <Calendar className="w-4 h-4" />
                                <span>Next: {sub.nextRenewal ? new Date(sub.nextRenewal).toLocaleDateString() : '-'}</span>
                            </div>

                            <div className="flex gap-2 pt-4 border-t border-dark-600/50">
                                <button
                                    onClick={() => toggleActive(sub)}
                                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${sub.active
                                        ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                                        : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                        }`}
                                >
                                    {sub.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                    {sub.active ? 'Pause' : 'Resume'}
                                </button>
                                <button
                                    onClick={() => openModal(sub)}
                                    className="px-4 py-2 rounded-lg text-sm font-medium bg-dark-700 text-dark-300 hover:bg-dark-600 transition-colors"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => deleteSub(sub)}
                                    className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4 text-red-400" />
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>

            {subscriptions.length === 0 && (
                <div className="text-center py-12">
                    <CreditCard className="w-16 h-16 text-dark-500 mx-auto mb-4" />
                    <p className="text-dark-400">No subscriptions yet. Add your first subscription!</p>
                </div>
            )}

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm" onClick={closeModal} />
                    <div className="relative glass-card p-6 w-full max-w-md animate-slide-up">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-white">
                                {editingSub ? 'Edit Subscription' : 'Add Subscription'}
                            </h2>
                            <button onClick={closeModal} className="p-2 rounded-lg hover:bg-dark-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-dark-300 mb-2">Service Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input-field"
                                    placeholder="e.g., ChatGPT Plus"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-dark-300 mb-2">Cost ($) *</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={formData.cost}
                                        onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                                        className="input-field"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-dark-300 mb-2">Billing Cycle</label>
                                    <select
                                        value={formData.cycle}
                                        onChange={(e) => setFormData({ ...formData, cycle: e.target.value })}
                                        className="input-field"
                                    >
                                        {cycles.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-dark-300 mb-2">Next Renewal Date *</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.nextRenewal}
                                    onChange={(e) => setFormData({ ...formData, nextRenewal: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                                    Cancel
                                </button>
                                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {editingSub ? 'Update' : 'Add Subscription'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

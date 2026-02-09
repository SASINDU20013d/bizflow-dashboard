import { useState, useEffect } from 'react'
import {
    Plus,
    TrendingUp,
    TrendingDown,
    ArrowUpCircle,
    ArrowDownCircle,
    X,
    Filter,
    Wallet,
    Building2,
    Loader2
} from 'lucide-react'
import { getAll, addRecord, SHEETS } from '../services/api'

const transactionTypes = ['All', 'Income', 'Expense']
const categories = ['Payment Received', 'Subscription', 'Tools', 'Marketing', 'Other']
const bankAccounts = ['BOC Account', 'Commercial Bank', 'Sampath Bank']

export default function Finance() {
    const [transactions, setTransactions] = useState([])
    const [filter, setFilter] = useState('All')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        type: 'Income',
        category: 'Payment Received',
        amount: '',
        account: 'BOC Account',
        description: ''
    })

    useEffect(() => {
        fetchTransactions()
    }, [])

    async function fetchTransactions() {
        setLoading(true)
        try {
            const data = await getAll(SHEETS.TRANSACTIONS)
            if (data && Array.isArray(data)) {
                const mapped = data.map(t => ({
                    id: t.id,
                    date: t.Date || new Date().toISOString().split('T')[0],
                    type: (t.Type || 'Income').toLowerCase(),
                    category: t.Category || '',
                    amount: parseFloat(t.Amount) || 0,
                    account: t.Account || '',
                    description: t.Description || ''
                }))
                setTransactions(mapped)
            }
        } catch (error) {
            console.error('Error fetching transactions:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredTransactions = transactions.filter(t =>
        filter === 'All' || t.type === filter.toLowerCase()
    )

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)

    // Calculate bank balances
    const bankBalances = bankAccounts.map(bank => {
        const income = transactions.filter(t => t.account === bank && t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
        const expense = transactions.filter(t => t.account === bank && t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
        return { name: bank, balance: income - expense }
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            const payload = {
                'Date': new Date().toISOString().split('T')[0],
                'Type': formData.type,
                'Category': formData.category,
                'Amount': formData.amount,
                'Account': formData.account,
                'Description': formData.description
            }
            await addRecord(SHEETS.TRANSACTIONS, payload)
            await fetchTransactions()
            closeModal()
        } catch (error) {
            console.error('Error saving transaction:', error)
            alert('Failed to save. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setFormData({
            type: 'Income',
            category: 'Payment Received',
            amount: '',
            account: 'BOC Account',
            description: ''
        })
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
                    <h1 className="text-3xl lg:text-4xl font-bold gradient-text">Finance</h1>
                    <p className="text-dark-400 mt-2">Track income, expenses, and bank accounts</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Add Transaction
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="stat-card">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-dark-400">Total Income</p>
                            <p className="text-2xl font-bold text-green-400">Rs. {totalIncome.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-rose-600">
                            <TrendingDown className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-dark-400">Total Expenses</p>
                            <p className="text-2xl font-bold text-red-400">Rs. {totalExpense.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div className="stat-card col-span-1 sm:col-span-2">
                    <div className="flex items-center gap-3 mb-4">
                        <Wallet className="w-5 h-5 text-primary-400" />
                        <p className="text-sm font-medium text-white">Net Profit</p>
                    </div>
                    <p className={`text-3xl font-bold ${totalIncome - totalExpense >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        Rs. {(totalIncome - totalExpense).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Bank Accounts */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Building2 className="w-5 h-5 text-primary-400" />
                    <h2 className="text-lg font-semibold text-white">Bank Accounts</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {bankBalances.map((bank, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-dark-700/50 border border-dark-600/50">
                            <p className="text-sm text-dark-400 mb-2">{bank.name}</p>
                            <div className="flex items-end justify-between">
                                <p className={`text-xl font-bold ${bank.balance >= 0 ? 'text-white' : 'text-red-400'}`}>
                                    Rs. {bank.balance.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Transactions */}
            <div className="glass-card p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h2 className="text-lg font-semibold text-white">Recent Transactions</h2>
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-dark-400" />
                        {transactionTypes.map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilter(type)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === type
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    {filteredTransactions.length === 0 ? (
                        <p className="text-dark-400 text-center py-8">No transactions yet</p>
                    ) : (
                        filteredTransactions.map((transaction) => (
                            <div key={transaction.id} className="flex items-center justify-between p-4 rounded-xl bg-dark-700/50 hover:bg-dark-700 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-xl ${transaction.type === 'income'
                                        ? 'bg-green-500/20'
                                        : 'bg-red-500/20'
                                        }`}>
                                        {transaction.type === 'income'
                                            ? <ArrowUpCircle className="w-5 h-5 text-green-400" />
                                            : <ArrowDownCircle className="w-5 h-5 text-red-400" />
                                        }
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">{transaction.description || transaction.category}</p>
                                        <p className="text-sm text-dark-400">{transaction.category} • {transaction.account}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                                        }`}>
                                        {transaction.type === 'income' ? '+' : '-'}Rs. {transaction.amount.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-dark-400">{new Date(transaction.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Add Transaction Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm" onClick={closeModal} />
                    <div className="relative glass-card p-6 w-full max-w-md animate-slide-up">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-white">Add Transaction</h2>
                            <button onClick={closeModal} className="p-2 rounded-lg hover:bg-dark-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-dark-300 mb-2">Type</label>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'Income' })}
                                        className={`flex-1 py-3 rounded-xl font-medium transition-all ${formData.type === 'Income'
                                            ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                                            : 'bg-dark-700 text-dark-400 border border-dark-600'
                                            }`}
                                    >
                                        Income
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'Expense' })}
                                        className={`flex-1 py-3 rounded-xl font-medium transition-all ${formData.type === 'Expense'
                                            ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                                            : 'bg-dark-700 text-dark-400 border border-dark-600'
                                            }`}
                                    >
                                        Expense
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-dark-300 mb-2">Amount (Rs.) *</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    className="input-field"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-dark-300 mb-2">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="input-field"
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-dark-300 mb-2">Bank Account</label>
                                <select
                                    value={formData.account}
                                    onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                                    className="input-field"
                                >
                                    {bankAccounts.map(bank => (
                                        <option key={bank} value={bank}>{bank}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-dark-300 mb-2">Description</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="input-field"
                                    placeholder="Enter description..."
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                                    Cancel
                                </button>
                                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Add Transaction
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

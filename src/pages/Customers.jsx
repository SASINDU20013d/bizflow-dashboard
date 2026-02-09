import { useState } from 'react'
import {
    Search,
    Plus,
    Phone,
    Mail,
    FolderKanban,
    X,
    User,
    Edit,
    Trash2
} from 'lucide-react'

// Mock data
const mockCustomers = [
    { id: 1, name: 'John Doe', mobile: '+94 77 123 4567', email: 'john@email.com', projects: 5, totalSpent: 25000 },
    { id: 2, name: 'Jane Smith', mobile: '+94 76 987 6543', email: 'jane@email.com', projects: 3, totalSpent: 18000 },
    { id: 3, name: 'Mike Johnson', mobile: '+94 71 555 8888', email: 'mike@email.com', projects: 8, totalSpent: 42000 },
    { id: 4, name: 'Sara Williams', mobile: '+94 70 222 3333', email: 'sara@email.com', projects: 2, totalSpent: 12000 },
    { id: 5, name: 'David Brown', mobile: '+94 75 444 7777', email: 'david@email.com', projects: 6, totalSpent: 35000 },
]

export default function Customers() {
    const [customers, setCustomers] = useState(mockCustomers)
    const [searchQuery, setSearchQuery] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCustomer, setEditingCustomer] = useState(null)
    const [formData, setFormData] = useState({ name: '', mobile: '', email: '', notes: '' })

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.mobile.includes(searchQuery)
    )

    const handleSubmit = (e) => {
        e.preventDefault()
        if (editingCustomer) {
            setCustomers(customers.map(c => c.id === editingCustomer.id ? { ...c, ...formData } : c))
        } else {
            const newCustomer = {
                id: Date.now(),
                ...formData,
                projects: 0,
                totalSpent: 0
            }
            setCustomers([newCustomer, ...customers])
        }
        closeModal()
    }

    const openModal = (customer = null) => {
        if (customer) {
            setEditingCustomer(customer)
            setFormData({ name: customer.name, mobile: customer.mobile, email: customer.email, notes: customer.notes || '' })
        } else {
            setEditingCustomer(null)
            setFormData({ name: '', mobile: '', email: '', notes: '' })
        }
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingCustomer(null)
        setFormData({ name: '', mobile: '', email: '', notes: '' })
    }

    const deleteCustomer = (id) => {
        if (confirm('Are you sure you want to delete this customer?')) {
            setCustomers(customers.filter(c => c.id !== id))
        }
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold gradient-text">Customers</h1>
                    <p className="text-dark-400 mt-2">Manage your customer database</p>
                </div>
                <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Add Customer
                </button>
            </div>

            {/* Search Bar */}
            <div className="glass-card p-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                    <input
                        type="text"
                        placeholder="Search by name or mobile number..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-field pl-12"
                    />
                </div>
            </div>

            {/* Customers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredCustomers.map((customer) => (
                    <div key={customer.id} className="glass-card-hover p-6 group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
                                <User className="w-6 h-6 text-primary-400" />
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openModal(customer)} className="p-2 rounded-lg hover:bg-dark-600 transition-colors">
                                    <Edit className="w-4 h-4 text-dark-300" />
                                </button>
                                <button onClick={() => deleteCustomer(customer.id)} className="p-2 rounded-lg hover:bg-red-500/20 transition-colors">
                                    <Trash2 className="w-4 h-4 text-red-400" />
                                </button>
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-3">{customer.name}</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-dark-300">
                                <Phone className="w-4 h-4 text-primary-400" />
                                <span>{customer.mobile}</span>
                            </div>
                            <div className="flex items-center gap-2 text-dark-300">
                                <Mail className="w-4 h-4 text-accent-400" />
                                <span className="truncate">{customer.email}</span>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-dark-600/50 flex justify-between">
                            <div>
                                <p className="text-xs text-dark-400">Projects</p>
                                <p className="text-lg font-semibold text-white flex items-center gap-1">
                                    <FolderKanban className="w-4 h-4 text-primary-400" />
                                    {customer.projects}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-dark-400">Total Spent</p>
                                <p className="text-lg font-semibold text-green-400">Rs. {customer.totalSpent.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredCustomers.length === 0 && (
                <div className="text-center py-12">
                    <User className="w-16 h-16 text-dark-500 mx-auto mb-4" />
                    <p className="text-dark-400">No customers found</p>
                </div>
            )}

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm" onClick={closeModal} />
                    <div className="relative glass-card p-6 w-full max-w-md animate-slide-up">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-white">
                                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
                            </h2>
                            <button onClick={closeModal} className="p-2 rounded-lg hover:bg-dark-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-dark-300 mb-2">Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input-field"
                                    placeholder="Enter customer name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-dark-300 mb-2">Mobile Number *</label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.mobile}
                                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                    className="input-field"
                                    placeholder="+94 7X XXX XXXX"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-dark-300 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="input-field"
                                    placeholder="customer@email.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-dark-300 mb-2">Notes</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="input-field resize-none h-24"
                                    placeholder="Additional notes..."
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary flex-1">
                                    {editingCustomer ? 'Update' : 'Add Customer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

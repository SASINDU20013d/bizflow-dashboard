import { useState } from 'react'
import {
    Plus,
    Calendar,
    DollarSign,
    User,
    FileText,
    X,
    Filter,
    Clock,
    CheckCircle2,
    AlertCircle
} from 'lucide-react'

const statusOptions = ['All', 'Pending', 'In Progress', 'Completed']
const projectTypes = ['Research Report', 'Assignment', 'University Project', 'Business Research', 'Other']
const bankAccounts = ['BOC Account', 'Commercial Bank', 'Sampath Bank']

// Mock data
const mockProjects = [
    { id: 1, customerId: 1, customerName: 'John Doe', type: 'Research Report', status: 'pending', deadline: '2026-02-15', price: 5000, paidAmount: 2500, bankAccount: 'BOC Account', notes: 'Topic: Market Analysis' },
    { id: 2, customerId: 2, customerName: 'Jane Smith', type: 'Assignment', status: 'progress', deadline: '2026-02-12', price: 3500, paidAmount: 3500, bankAccount: 'Commercial Bank', notes: '' },
    { id: 3, customerId: 3, customerName: 'Mike Johnson', type: 'University Project', status: 'progress', deadline: '2026-02-20', price: 8000, paidAmount: 4000, bankAccount: 'Sampath Bank', notes: 'Final year project' },
    { id: 4, customerId: 4, customerName: 'Sara Williams', type: 'Research Report', status: 'completed', deadline: '2026-02-10', price: 6500, paidAmount: 6500, bankAccount: 'BOC Account', notes: '' },
    { id: 5, customerId: 5, customerName: 'David Brown', type: 'Business Research', status: 'pending', deadline: '2026-02-25', price: 12000, paidAmount: 0, bankAccount: 'Commercial Bank', notes: 'Need source documents' },
]

function getStatusIcon(status) {
    switch (status) {
        case 'pending': return <AlertCircle className="w-4 h-4 text-yellow-400" />
        case 'progress': return <Clock className="w-4 h-4 text-blue-400" />
        case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-400" />
        default: return null
    }
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

export default function Projects() {
    const [projects, setProjects] = useState(mockProjects)
    const [filter, setFilter] = useState('All')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingProject, setEditingProject] = useState(null)
    const [formData, setFormData] = useState({
        customerName: '',
        type: 'Assignment',
        status: 'pending',
        deadline: '',
        price: '',
        paidAmount: '',
        bankAccount: 'BOC Account',
        notes: ''
    })

    const filteredProjects = projects.filter(p =>
        filter === 'All' ||
        p.status === filter.toLowerCase().replace(' ', '')
    )

    const handleSubmit = (e) => {
        e.preventDefault()
        if (editingProject) {
            setProjects(projects.map(p => p.id === editingProject.id ? {
                ...p,
                ...formData,
                price: Number(formData.price),
                paidAmount: Number(formData.paidAmount)
            } : p))
        } else {
            const newProject = {
                id: Date.now(),
                customerId: Date.now(),
                ...formData,
                price: Number(formData.price),
                paidAmount: Number(formData.paidAmount)
            }
            setProjects([newProject, ...projects])
        }
        closeModal()
    }

    const openModal = (project = null) => {
        if (project) {
            setEditingProject(project)
            setFormData({
                customerName: project.customerName,
                type: project.type,
                status: project.status,
                deadline: project.deadline,
                price: project.price.toString(),
                paidAmount: project.paidAmount.toString(),
                bankAccount: project.bankAccount,
                notes: project.notes || ''
            })
        } else {
            setEditingProject(null)
            setFormData({
                customerName: '',
                type: 'Assignment',
                status: 'pending',
                deadline: '',
                price: '',
                paidAmount: '',
                bankAccount: 'BOC Account',
                notes: ''
            })
        }
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingProject(null)
    }

    const updateStatus = (id, newStatus) => {
        setProjects(projects.map(p => p.id === id ? { ...p, status: newStatus } : p))
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold gradient-text">Projects</h1>
                    <p className="text-dark-400 mt-2">Track assignments, deadlines, and payments</p>
                </div>
                <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    New Project
                </button>
            </div>

            {/* Filters */}
            <div className="glass-card p-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    <Filter className="w-5 h-5 text-dark-400 flex-shrink-0" />
                    {statusOptions.map((option) => (
                        <button
                            key={option}
                            onClick={() => setFilter(option)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${filter === option
                                    ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white'
                                    : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                                }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </div>

            {/* Projects List */}
            <div className="space-y-4">
                {filteredProjects.map((project) => (
                    <div key={project.id} className="glass-card-hover p-4 lg:p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                            {/* Left Section */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                    {getStatusIcon(project.status)}
                                    <h3 className="text-lg font-semibold text-white truncate">{project.customerName}</h3>
                                    {getStatusBadge(project.status)}
                                </div>
                                <div className="flex flex-wrap gap-4 text-sm text-dark-300">
                                    <span className="flex items-center gap-1">
                                        <FileText className="w-4 h-4 text-dark-400" />
                                        {project.type}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4 text-dark-400" />
                                        {new Date(project.deadline).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="flex items-center gap-6 lg:gap-8">
                                <div>
                                    <p className="text-xs text-dark-400 mb-1">Paid / Total</p>
                                    <p className="font-medium">
                                        <span className="text-green-400">Rs. {project.paidAmount.toLocaleString()}</span>
                                        <span className="text-dark-400"> / </span>
                                        <span className="text-white">Rs. {project.price.toLocaleString()}</span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-dark-400 mb-1">Bank</p>
                                    <p className="text-sm text-dark-300">{project.bankAccount}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                {project.status !== 'completed' && (
                                    <select
                                        value={project.status}
                                        onChange={(e) => updateStatus(project.id, e.target.value)}
                                        className="input-field py-2 px-3 text-sm w-auto"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                )}
                                <button
                                    onClick={() => openModal(project)}
                                    className="btn-secondary py-2 px-4 text-sm"
                                >
                                    Edit
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredProjects.length === 0 && (
                <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-dark-500 mx-auto mb-4" />
                    <p className="text-dark-400">No projects found</p>
                </div>
            )}

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm" onClick={closeModal} />
                    <div className="relative glass-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-white">
                                {editingProject ? 'Edit Project' : 'New Project'}
                            </h2>
                            <button onClick={closeModal} className="p-2 rounded-lg hover:bg-dark-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-dark-300 mb-2">Customer Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.customerName}
                                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                    className="input-field"
                                    placeholder="Enter customer name"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-dark-300 mb-2">Project Type *</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="input-field"
                                    >
                                        {projectTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-dark-300 mb-2">Deadline *</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.deadline}
                                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-dark-300 mb-2">Total Price (Rs.) *</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="input-field"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-dark-300 mb-2">Paid Amount (Rs.)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.paidAmount}
                                        onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
                                        className="input-field"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-dark-300 mb-2">Bank Account</label>
                                <select
                                    value={formData.bankAccount}
                                    onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                                    className="input-field"
                                >
                                    {bankAccounts.map(bank => (
                                        <option key={bank} value={bank}>{bank}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-dark-300 mb-2">Notes</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="input-field resize-none h-20"
                                    placeholder="Additional notes..."
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary flex-1">
                                    {editingProject ? 'Update' : 'Create Project'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

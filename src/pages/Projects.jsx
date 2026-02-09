import { useState, useEffect } from 'react'
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
    AlertCircle,
    Loader2
} from 'lucide-react'
import { getAll, addRecord, updateRecord, SHEETS } from '../services/api'

const statusOptions = ['All', 'Pending', 'In Progress', 'Completed']
const projectTypes = ['Research Report', 'Assignment', 'University Project', 'Business Research', 'Other']
const bankAccounts = ['BOC Account', 'Commercial Bank', 'Sampath Bank']

function getStatusIcon(status) {
    const s = (status || '').toLowerCase().replace(' ', '')
    switch (s) {
        case 'pending': return <AlertCircle className="w-4 h-4 text-yellow-400" />
        case 'inprogress': return <Clock className="w-4 h-4 text-blue-400" />
        case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-400" />
        default: return <AlertCircle className="w-4 h-4 text-yellow-400" />
    }
}

function getStatusBadge(status) {
    const s = (status || '').toLowerCase().replace(' ', '')
    const badges = {
        pending: 'badge-pending',
        inprogress: 'badge-progress',
        completed: 'badge-completed'
    }
    const labels = {
        pending: 'Pending',
        inprogress: 'In Progress',
        completed: 'Completed'
    }
    return <span className={`badge ${badges[s] || 'badge-pending'}`}>{labels[s] || status}</span>
}

export default function Projects() {
    const [projects, setProjects] = useState([])
    const [filter, setFilter] = useState('All')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingProject, setEditingProject] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        customerId: '',
        type: 'Assignment',
        status: 'Pending',
        deadline: '',
        price: '',
        paidAmount: '',
        bankAccount: 'BOC Account',
        notes: ''
    })

    useEffect(() => {
        fetchProjects()
    }, [])

    async function fetchProjects() {
        setLoading(true)
        try {
            const data = await getAll(SHEETS.PROJECTS)
            if (data && Array.isArray(data)) {
                const mapped = data.map(p => ({
                    id: p.id,
                    customerId: p['Customer ID'] || '',
                    customerName: p['Customer ID'] || 'Unknown',
                    type: p['Project Type'] || 'Project',
                    status: p.Status || 'Pending',
                    deadline: p.Deadline || '',
                    price: parseFloat(p.Price) || 0,
                    paidAmount: parseFloat(p['Paid Amount']) || 0,
                    bankAccount: p['Bank Account'] || '',
                    notes: p.Notes || ''
                }))
                setProjects(mapped)
            }
        } catch (error) {
            console.error('Error fetching projects:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredProjects = projects.filter(p => {
        if (filter === 'All') return true
        const projectStatus = (p.status || '').toLowerCase().replace(' ', '')
        const filterStatus = filter.toLowerCase().replace(' ', '')
        return projectStatus === filterStatus
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            const payload = {
                'Customer ID': formData.customerId,
                'Project Type': formData.type,
                'Status': formData.status,
                'Deadline': formData.deadline,
                'Price': formData.price,
                'Paid Amount': formData.paidAmount || '0',
                'Bank Account': formData.bankAccount,
                'Notes': formData.notes
            }

            if (editingProject) {
                await updateRecord(SHEETS.PROJECTS, editingProject.id, payload)
            } else {
                await addRecord(SHEETS.PROJECTS, payload)
            }
            await fetchProjects()
            closeModal()
        } catch (error) {
            console.error('Error saving project:', error)
            alert('Failed to save. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    const openModal = (project = null) => {
        if (project) {
            setEditingProject(project)
            setFormData({
                customerId: project.customerId,
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
                customerId: '',
                type: 'Assignment',
                status: 'Pending',
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

    const updateStatus = async (project, newStatus) => {
        try {
            await updateRecord(SHEETS.PROJECTS, project.id, { Status: newStatus })
            setProjects(projects.map(p => p.id === project.id ? { ...p, status: newStatus } : p))
        } catch (error) {
            console.error('Error updating status:', error)
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
                                        {project.deadline ? new Date(project.deadline).toLocaleDateString() : '-'}
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
                                    <p className="text-sm text-dark-300">{project.bankAccount || '-'}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                {project.status.toLowerCase() !== 'completed' && (
                                    <select
                                        value={project.status}
                                        onChange={(e) => updateStatus(project, e.target.value)}
                                        className="input-field py-2 px-3 text-sm w-auto"
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
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
                    <p className="text-dark-400">{filter !== 'All' ? 'No projects with this status' : 'No projects yet. Add your first project!'}</p>
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
                                    value={formData.customerId}
                                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
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
                                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
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

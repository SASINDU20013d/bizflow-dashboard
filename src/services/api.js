/**
 * API Service for BizFlow Dashboard
 * Connects to Google Apps Script backend
 */

// TODO: Replace with your Google Apps Script Web App URL after deployment
const API_BASE_URL = '';

/**
 * Check if API is configured
 */
const isApiConfigured = () => {
    return API_BASE_URL && API_BASE_URL.length > 0;
};

/**
 * Generic fetch wrapper with error handling
 */
const apiRequest = async (url, options = {}) => {
    if (!isApiConfigured()) {
        console.warn('API not configured. Using local mock data.');
        return null;
    }

    try {
        const response = await fetch(url, {
            ...options,
            mode: 'cors',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

/**
 * GET request helper
 */
const get = async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}?${queryString}`;
    return apiRequest(url);
};

/**
 * POST request helper
 */
const post = async (body) => {
    return apiRequest(API_BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
};

// ============================================
// API METHODS
// ============================================

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async () => {
    return get({ action: 'getStats' });
};

/**
 * Get all records from a sheet
 */
export const getAll = async (sheet) => {
    return get({ action: 'getAll', sheet });
};

/**
 * Search customers by name or mobile
 */
export const searchCustomers = async (query) => {
    return get({ action: 'search', query });
};

/**
 * Add a new record
 */
export const addRecord = async (sheet, payload) => {
    return post({ action: 'add', sheet, payload });
};

/**
 * Update a record
 */
export const updateRecord = async (sheet, id, payload) => {
    return post({ action: 'update', sheet, id, payload });
};

/**
 * Delete a record
 */
export const deleteRecord = async (sheet, id) => {
    return post({ action: 'delete', sheet, id });
};

// ============================================
// SHEET NAMES
// ============================================
export const SHEETS = {
    CUSTOMERS: 'Customers',
    PROJECTS: 'Projects',
    TRANSACTIONS: 'Transactions',
    SUBSCRIPTIONS: 'Subscriptions',
};

export { isApiConfigured };

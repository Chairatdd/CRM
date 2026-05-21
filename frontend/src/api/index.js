import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:3001/api' })
const dotnetApi = axios.create({ baseURL: 'http://localhost:5050/api' })

// ── Dashboard ──────────────────────────────────────────
export const getDashboardStats       = () => api.get('/dashboard/stats')
export const getRevenueTrend         = () => api.get('/dashboard/revenue-trend')
export const getSegmentDistribution  = () => api.get('/dashboard/segment-distribution')
export const getRecentInteractions   = () => api.get('/dashboard/recent-interactions')
export const getTopCustomers         = () => api.get('/dashboard/top-customers')

// ── Customers ──────────────────────────────────────────
export const getCustomers       = (params) => api.get('/customers', { params })
export const getCustomer        = (id)     => api.get(`/customers/${id}`)
export const getCustomerOrders  = (id)     => api.get(`/customers/${id}/orders`)
export const getCustomerInteractions = (id) => api.get(`/customers/${id}/interactions`)
export const createCustomer     = (data)   => api.post('/customers', data)
export const updateCustomer     = (id, data) => api.put(`/customers/${id}`, data)

// ── Segments ───────────────────────────────────────────
export const getSegments          = () => api.get('/segments')
export const getSegmentCustomers  = (id) => api.get(`/segments/${id}/customers`)

// ── Interactions ───────────────────────────────────────
export const getInteractions    = (params) => api.get('/interactions', { params })
export const createInteraction  = (data)   => api.post('/interactions', data)

// ── Orders ─────────────────────────────────────────────
export const getOrders = (params) => api.get('/orders', { params })

// ── C# API — Users / Auth ──────────────────────────────
export const login    = (data) => dotnetApi.post('/auth/login', data)
export const getUsers = ()     => dotnetApi.get('/users')

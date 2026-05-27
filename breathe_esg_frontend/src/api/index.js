import client from './client';

export const login = (email, password) => client.post('/api/auth/token/', { email, password });

export const getMe = () => client.get('/api/auth/me/');

export const getDashboardSummary = () => client.get('/api/dashboard/summary/').then(res => res.data);

export const getSources = () => client.get('/api/sources/').then(res => res.data);

export const uploadBatch = (source_id, file) => {
  const formData = new FormData();
  formData.append('source_id', source_id);
  formData.append('file', file);
  return client.post('/api/batches/upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const getBatches = () => client.get('/api/batches/').then(res => res.data);

export const getRecords = (params) => client.get('/api/records/', { params }).then(res => res.data);

export const reviewRecord = (id, action, reason) => client.patch(`/api/records/${id}/review/`, { action, reason }).then(res => res.data);

export const bulkApprove = (batch_id) => client.post('/api/records/bulk-approve/', { batch_id }).then(res => res.data);

export const lockRecords = () => client.post('/api/records/lock/').then(res => res.data);

export const getExportUrl = () => {
    const token = localStorage.getItem('access_token');
    return `${client.defaults.baseURL}/api/records/export/?token=${token}`; // Simplified for prototype, ideally use a short-lived download token
}

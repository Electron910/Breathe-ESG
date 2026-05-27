import { useState, useEffect } from 'react';
import { Check, X, Code, CheckSquare, CheckCircle, Lock } from 'lucide-react';
import { getRecords, getBatches, reviewRecord, bulkApprove } from '../api';
import StatusBadge from '../components/StatusBadge';
import { format } from 'date-fns';

export default function ReviewPage({ userRole }) {
  const [records, setRecords] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [rawModalData, setRawModalData] = useState(null);
  const [rejectModalData, setRejectModalData] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [batchesRes, recordsRes] = await Promise.all([
        getBatches(),
        getRecords({ batch: selectedBatch, status: statusFilter !== 'ALL' ? statusFilter : '' })
      ]);
      setBatches(batchesRes);
      setRecords(recordsRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedBatch, statusFilter]);

  const handleAction = async (id, action, reason = '') => {
    try {
      await reviewRecord(id, action, reason);
      setRecords(records.map(r => {
        if (r.id === id) {
          return { 
            ...r, 
            status: action === 'APPROVE' ? 'APPROVED' : 'ERROR', 
            flag_reason: action === 'REJECT' ? (reason || 'Manually rejected') : r.flag_reason 
          };
        }
        return r;
      }).filter(r => statusFilter === 'ALL' || r.status === statusFilter));
    } catch (err) {
      alert('Action failed');
    }
  };

  const handleBulkApprove = async () => {
    if (!selectedBatch) return alert("Select a batch to bulk approve");
    if (confirm("Are you sure you want to approve all PENDING records in this batch?")) {
      try {
        await bulkApprove(selectedBatch);
        loadData();
      } catch (err) {
        alert("Bulk approve failed");
      }
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-widest uppercase" style={{fontFamily: '"Courier New", monospace'}} className="">Review & Approve</h1>
          <p className="mt-1 text-sm text-gray-400">Validate parsed data before locking it for audit.</p>
        </div>
        <div className="flex-1 flex justify-end items-end space-x-3">
          {userRole === 'ADMIN' && (
            <>
              <button 
                onClick={handleBulkApprove}
                disabled={!selectedBatch || statusFilter !== 'PENDING'}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <CheckSquare className="w-4 h-4 mr-2" /> Bulk Approve Pending
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-gray-800/80 backdrop-blur-md border border-gray-700 shadow-lg p-4 rounded-xl shadow-sm border border-gray-700 flex gap-4">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-400 mb-1">Filter by Batch</label>
          <select 
            value={selectedBatch} 
            onChange={e => setSelectedBatch(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 bg-gray-800 text-white text-base border-gray-600 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md border"
          >
            <option value="" className="bg-gray-800 text-white">All Batches</option>
            {batches.map(b => (
              <option key={b.id} value={b.id} className="bg-gray-800 text-white">{b.raw_file.split('/').pop()} ({b.status})</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-400 mb-1">Filter by Status</label>
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 bg-gray-800 text-white text-base border-gray-600 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md border"
          >
            <option value="ALL" className="bg-gray-800 text-white">All Statuses</option>
            <option value="PENDING" className="bg-gray-800 text-white">Pending</option>
            <option value="SUSPICIOUS" className="bg-gray-800 text-white">Suspicious</option>
            <option value="ERROR" className="bg-gray-800 text-white">Error</option>
            <option value="APPROVED" className="bg-gray-800 text-white">Approved</option>
            <option value="LOCKED" className="bg-gray-800 text-white">Locked</option>
          </select>
        </div>
      </div>

      <div className="bg-gray-800/80 backdrop-blur-md border border-gray-700 shadow-lg shadow-sm rounded-xl border border-gray-700 flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Scope / Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Activity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">CO2e (kg)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800/80 backdrop-blur-md border border-gray-700 shadow-lg divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-400 animate-pulse">Loading...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-400">No records found matching filters.</td></tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-bold">
                      {record.period_start ? format(new Date(record.period_start), 'MMM d, yyyy') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white font-bold">{record.source_type}</div>
                      <div className="text-xs text-gray-400 truncate max-w-[120px]">{record.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white font-bold">Scope {record.scope}</div>
                      <div className="text-xs text-gray-400">{record.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white font-bold">{parseFloat(record.activity_value || 0).toLocaleString()}</div>
                      <div className="text-xs text-gray-400">{record.activity_unit}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white font-bold">
                      {parseFloat(record.co2e_kg || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={record.status} reason={record.flag_reason} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button onClick={() => setRawModalData(record.raw_row)} className="text-gray-400 hover:text-blue-600 transition-colors" title="View Raw">
                        <Code className="w-5 h-5 inline" />
                      </button>
                      {userRole === 'ADMIN' && ['PENDING', 'SUSPICIOUS'].includes(record.status) && (
                        <>
                          <button onClick={() => handleAction(record.id, 'APPROVE')} className="text-gray-400 hover:text-emerald-600 transition-colors" title="Approve">
                            <Check className="w-5 h-5 inline" />
                          </button>
                          <button onClick={() => {
                            setRejectReason('');
                            setRejectModalData(record);
                          }} className="text-gray-400 hover:text-red-600 transition-colors" title="Reject">
                            <X className="w-5 h-5 inline" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {rawModalData && (
        <div className="fixed inset-0 bg-gray-800/500 bg-opacity-75 flex items-center justify-center p-4 z-50 backdrop-blur-sm transition-opacity">
          <div className="bg-gray-800/80 backdrop-blur-md border border-gray-700 shadow-lg rounded-xl shadow-xl max-w-2xl w-full p-6">
            <h3 className="text-lg font-medium text-white font-bold mb-4 flex justify-between">
              Raw Record Data
              <button onClick={() => setRawModalData(null)} className="text-gray-400 hover:text-gray-400"><X className="w-5 h-5" /></button>
            </h3>
            <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-96">
              <pre className="text-sm text-green-400 font-mono">
                {JSON.stringify(rawModalData, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {rejectModalData && (
        <div className="fixed inset-0 bg-gray-800/500 bg-opacity-75 flex items-center justify-center p-4 z-50 backdrop-blur-sm transition-opacity">
          <div className="bg-gray-800/80 backdrop-blur-md border border-gray-700 shadow-lg rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-white font-bold mb-4">
              Reject Record
            </h3>
            <p className="text-sm text-gray-400 mb-4">Please provide a reason for rejecting this record.</p>
            <input
              type="text"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm border py-2 px-3 mb-4"
              placeholder="e.g. Invalid plant code"
              autoFocus
            />
            <div className="flex justify-end space-x-3">
              <button onClick={() => setRejectModalData(null)} className="px-4 py-2 text-sm font-medium text-gray-200 bg-gray-800/80 backdrop-blur-md border border-gray-700 shadow-lg border border-gray-300 rounded-md shadow-sm hover:bg-gray-800/50">Cancel</button>
              <button onClick={() => {
                handleAction(rejectModalData.id, 'REJECT', rejectReason);
                setRejectModalData(null);
              }} className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700">Confirm Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

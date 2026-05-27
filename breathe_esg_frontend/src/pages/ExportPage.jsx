import { useState } from 'react';
import { Download, Lock } from 'lucide-react';
import { lockRecords, getExportUrl } from '../api';

export default function ExportPage({ userRole }) {
  const [loading, setLoading] = useState(false);
  const [lockMessage, setLockMessage] = useState('');

  const handleLock = async () => {
    if(confirm("Are you sure? Locking approved records will prevent any further edits and make them ready for export.")) {
      setLoading(true);
      try {
        const res = await lockRecords();
        setLockMessage(`Successfully locked ${res.locked_count} records.`);
        setTimeout(() => setLockMessage(''), 5000);
      } catch (err) {
        alert("Failed to lock records.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleExport = () => {
    window.open(getExportUrl(), '_blank');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-widest uppercase" style={{fontFamily: '"Courier New", monospace'}} className="">Export & Audit</h1>
        <p className="mt-1 text-sm text-gray-400">Lock approved records and generate immutable exports for auditors.</p>
      </div>

      <div className="bg-gray-800/80 backdrop-blur-md border border-gray-700 shadow-lg shadow-sm rounded-xl border border-gray-700 overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex items-center mb-6">
            <div className="flex-shrink-0 bg-blue-100 rounded-full p-3">
              <Lock className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-white font-bold">1. Lock Approved Records</h3>
              <p className="text-sm text-gray-400">Only APPROVED records can be locked. Once locked, they cannot be edited or deleted.</p>
            </div>
          </div>
          {userRole === 'ADMIN' ? (
            <>
              <button
                onClick={handleLock}
                disabled={loading}
                className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
              >
                <Lock className="w-4 h-4 mr-2" /> {loading ? 'Locking...' : 'Lock Approved Records'}
              </button>
              {lockMessage && <p className="mt-3 text-sm text-emerald-600 font-medium">{lockMessage}</p>}
            </>
          ) : (
            <p className="text-sm text-red-500 italic">You must be an Admin to lock records.</p>
          )}
        </div>
        
        <div className="border-t border-gray-700"></div>
        
        <div className="p-6 sm:p-8 bg-gray-800/50">
          <div className="flex items-center mb-6">
            <div className="flex-shrink-0 bg-emerald-100 rounded-full p-3">
              <Download className="h-8 w-8 text-emerald-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-white font-bold">2. Download Audit CSV</h3>
              <p className="text-sm text-gray-400">Generates a CSV of all LOCKED records, including their calculated CO2e and provenance data.</p>
            </div>
          </div>
          <button
            onClick={handleExport}
            className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-emerald-700 bg-emerald-100 hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            <Download className="w-4 h-4 mr-2" /> Export Locked Records
          </button>
        </div>
      </div>
    </div>
  );
}

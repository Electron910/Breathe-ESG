import { useState, useEffect } from 'react';
import { UploadCloud, CheckCircle2 } from 'lucide-react';
import { getSources, uploadBatch, getBatches } from '../api';

export default function IngestPage() {
  const [sources, setSources] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedSource, setSelectedSource] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const loadData = () => {
    getSources().then(setSources);
    getBatches().then(setBatches);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedSource || !file) return;
    
    setLoading(true);
    try {
      await uploadBatch(selectedSource, file);
      setSuccess(true);
      setFile(null);
      setTimeout(() => setSuccess(false), 3000);
      loadData();
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-widest uppercase" style={{fontFamily: '"Courier New", monospace'}} className="">Ingest Data</h1>
        <p className="mt-1 text-sm text-gray-400">Upload CSV files from your data sources for parsing.</p>
      </div>

      <div className="bg-gray-800/80 backdrop-blur-md border border-gray-700 shadow-lg shadow-sm rounded-xl border border-gray-700 p-6">
        <form onSubmit={handleUpload} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-200">Data Source</label>
            <select
              required
              value={selectedSource}
              onChange={e => setSelectedSource(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 bg-gray-800 text-white text-base border-gray-600 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md border"
            >
              <option value="" className="bg-gray-800 text-white">Select a source...</option>
              {sources.map(s => (
                <option key={s.id} value={s.id} className="bg-gray-800 text-white">{s.name} ({s.source_type})</option>
              ))}
            </select>
            {sources.length === 0 && (
              <p className="mt-2 text-sm text-red-600">No sources configured. Please ask admin to configure sources.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200">CSV File</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-emerald-400 transition-colors">
              <div className="space-y-1 text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-300 justify-center">
                  <label className="relative cursor-pointer bg-gray-800/80 backdrop-blur-md border border-gray-700 shadow-lg rounded-md font-medium text-emerald-600 hover:text-emerald-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-emerald-500">
                    <span>Upload a file</span>
                    <input type="file" className="sr-only" accept=".csv" onChange={e => setFile(e.target.files[0])} />
                  </label>
                </div>
                <p className="text-xs text-gray-400">CSV up to 10MB</p>
                {file && <p className="text-sm font-bold text-emerald-600 mt-2">{file.name}</p>}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            {success ? (
              <span className="flex items-center text-emerald-600 text-sm font-medium">
                <CheckCircle2 className="w-5 h-5 mr-2" /> Upload successful!
              </span>
            ) : <div/>}
            <button
              type="submit"
              disabled={!file || !selectedSource || loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Upload & Parse'}
            </button>
          </div>
        </form>
      </div>

      <h2 className="text-lg font-medium text-white font-bold mt-10">Recent Batches</h2>
      <div className="bg-gray-800/80 backdrop-blur-md border border-gray-700 shadow-lg shadow-sm rounded-xl border border-gray-700 overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {batches.map(batch => (
            <li key={batch.id} className="p-4 hover:bg-gray-800/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-600 truncate">{batch.raw_file.split('/').pop()}</p>
                  <p className="text-sm text-gray-400 mt-1">{new Date(batch.created_at).toLocaleString()}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-400 text-right">
                    <p>{batch.row_count} rows</p>
                    <p className="text-red-500">{batch.error_count} errors</p>
                  </div>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${batch.status === 'COMPLETE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {batch.status}
                  </span>
                </div>
              </div>
            </li>
          ))}
          {batches.length === 0 && <li className="p-4 text-sm text-gray-400">No batches uploaded yet.</li>}
        </ul>
      </div>
    </div>
  );
}

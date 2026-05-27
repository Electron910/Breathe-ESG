import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { getDashboardSummary } from '../api';
import { Database, AlertTriangle, CheckCircle, FileText } from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardSummary().then(res => {
      setData(res);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-6 py-1"><div className="h-2 bg-slate-200 rounded"></div></div></div>;
  if (!data) return <div>Failed to load dashboard</div>;

  const scopeData = data.scope_totals.map(s => ({
    name: `Scope ${s.scope}`,
    value: parseFloat(s.total_co2e) || 0
  }));
  const COLORS = ['#059669', '#10b981', '#34d399'];

  const pendingCount = data.status_counts.find(s => s.status === 'PENDING')?.count || 0;
  const suspiciousCount = data.status_counts.find(s => s.status === 'SUSPICIOUS')?.count || 0;
  const errorCount = data.status_counts.find(s => s.status === 'ERROR')?.count || 0;
  const approvedCount = data.status_counts.find(s => s.status === 'APPROVED')?.count || 0;
  const lockedCount = data.status_counts.find(s => s.status === 'LOCKED')?.count || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-widest uppercase" style={{fontFamily: '"Courier New", monospace'}} className="">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-gray-400">A summary of all ingested emissions data.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-gray-800/80 backdrop-blur-md border border-gray-700 shadow-lg overflow-hidden shadow-sm rounded-xl border border-gray-700 p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-emerald-100 rounded-md p-3">
              <Database className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-400 truncate">Total Records</dt>
                <dd className="text-2xl font-bold text-white tracking-widest uppercase" style={{fontFamily: '"Courier New", monospace'}} className="">{data.total_records}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/80 backdrop-blur-md border border-gray-700 shadow-lg overflow-hidden shadow-sm rounded-xl border border-gray-700 p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-400 truncate">Pending / Suspicious</dt>
                <dd className="text-2xl font-bold text-white tracking-widest uppercase" style={{fontFamily: '"Courier New", monospace'}} className="">{pendingCount} / {suspiciousCount}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/80 backdrop-blur-md border border-gray-700 shadow-lg overflow-hidden shadow-sm rounded-xl border border-gray-700 p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
              <FileText className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-400 truncate">Errors</dt>
                <dd className="text-2xl font-bold text-white tracking-widest uppercase" style={{fontFamily: '"Courier New", monospace'}} className="">{errorCount}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/80 backdrop-blur-md border border-gray-700 shadow-lg overflow-hidden shadow-sm rounded-xl border border-gray-700 p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-400 truncate">Approved & Locked</dt>
                <dd className="text-2xl font-bold text-white tracking-widest uppercase" style={{fontFamily: '"Courier New", monospace'}} className="">{approvedCount + lockedCount}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/80 backdrop-blur-md border border-gray-700 shadow-lg shadow-sm rounded-xl border border-gray-700 p-6">
          <h3 className="text-lg font-medium text-white font-bold mb-4">Emissions by Scope (kg CO2e)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={scopeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {scopeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value.toLocaleString()} kg`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-800/80 backdrop-blur-md border border-gray-700 shadow-lg shadow-sm rounded-xl border border-gray-700 p-6">
          <h3 className="text-lg font-medium text-white font-bold mb-4">Ingestion by Source</h3>
          <div className="flow-root mt-4">
            <ul className="-my-5 divide-y divide-gray-200">
              {data.source_counts.map((s) => (
                <li key={s.source_type} className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white font-bold truncate">
                        {s.source_type}
                      </p>
                    </div>
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {s.count} records
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            {data.source_counts.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No data ingested yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, UploadCloud, ListChecks, Download, LogOut, Wind } from 'lucide-react';
import clsx from 'clsx';

export default function Layout({ children, onLogout }) {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Ingest Data', href: '/ingest', icon: UploadCloud },
    { name: 'Review & Approve', href: '/review', icon: ListChecks },
    { name: 'Export Audit', href: '/export', icon: Download },
  ];

  return (
    <div className="flex h-screen bg-gray-800/50">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-gray-800 border-r border-gray-700">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <Link to="/" className="flex items-center text-xl font-bold text-white tracking-widest uppercase" style={{fontFamily: '"Courier New", monospace'}}>
                <img src="/logo.svg" alt="Breathe ESG Logo" className="w-8 h-8 mr-3" />
                Breathe ESG
              </Link>
            </div>
            <nav className="mt-8 flex-1 px-2 space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={clsx(
                      isActive
                        ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-500/30'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                      'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors'
                    )}
                    style={{fontFamily: '"Courier New", monospace'}}
                  >
                    <item.icon
                      className={clsx(
                        isActive ? 'text-emerald-400' : 'text-gray-400 group-hover:text-gray-300',
                        'flex-shrink-0 -ml-1 mr-3 h-5 w-5 transition-colors'
                      )}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-700 p-4">
            <button
              onClick={onLogout}
              className="flex-shrink-0 w-full group block text-gray-300 hover:text-white"
              style={{fontFamily: '"Courier New", monospace'}}
            >
              <div className="flex items-center">
                <LogOut className="inline-block h-5 w-5 mr-3 text-gray-400 group-hover:text-gray-300" />
                <p className="text-sm font-medium">LOGOUT</p>
              </div>
            </button>
          </div>
        </div>
      </div>
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          <div className="py-6 h-full min-h-screen bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 text-gray-100">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

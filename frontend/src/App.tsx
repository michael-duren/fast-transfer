import { useEffect, useState } from 'react';
import FileUpload from './components/FileUpload';
import UploadList from './components/UploadList';
import { getExpiringUploads, getRecentUploads } from './api';
import type { FileMetadata } from './types';

function App() {
  const [recentUploads, setRecentUploads] = useState<FileMetadata[]>([]);
  const [expiringUploads, setExpiringUploads] = useState<FileMetadata[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [recent, expiring] = await Promise.all([
        getRecentUploads(),
        getExpiringUploads(),
      ]);
      setRecentUploads(recent);
      setExpiringUploads(expiring);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  const handleUploadSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-8 font-sans selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <header className="flex flex-col items-center justify-center text-center space-y-4 pt-10">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 blur opacity-40"></div>
            <h1 className="relative text-5xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
              FastTransfer
            </h1>
          </div>
          <p className="text-slate-400 text-lg max-w-2xl">
            Secure, fast, and simple file sharing. Upload your files and share the link instantly.
          </p>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Main Upload Area */}
          <div className="lg:col-span-7 space-y-8">
            <FileUpload onUploadSuccess={handleUploadSuccess} />

            {/* Instructions / Info Panel */}
            <div className="glass-panel p-6">
              <h3 className="text-lg font-semibold text-slate-300 mb-3">How it works</h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  Drag and drop your file.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  Get a secure link instantly.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  Files expire automatically after 24 hours.
                </li>
              </ul>
            </div>
          </div>

          {/* Sidebar Lists */}
          <div className="lg:col-span-5 space-y-6">

            {/* Recent Uploads */}
            <div className="h-[400px]">
              <UploadList
                title="Recent Uploads"
                files={recentUploads}
                refreshing={loading}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                }
              />
            </div>

            {/* Expiring Soon */}
            <div className="h-[300px]">
              <UploadList
                title="Expiring Soon"
                files={expiringUploads}
                refreshing={loading}
                emptyMessage="No files expiring soon."
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75h.007v.008H12v-.008Z" />
                  </svg>
                }
              />
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

export default App;

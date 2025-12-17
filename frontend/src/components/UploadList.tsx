import React from 'react';
import type { FileMetadata } from '../types';

interface UploadListProps {
    title: string;
    files: FileMetadata[];
    icon?: React.ReactNode;
    emptyMessage?: string;
    refreshing?: boolean;
}

const UploadList: React.FC<UploadListProps> = ({ title, files, icon, emptyMessage = "No uploads found.", refreshing }) => {
    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleString();
        } catch {
            return dateString;
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="glass-panel p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    {icon && <div className="text-blue-400">{icon}</div>}
                    <h3 className="text-xl font-bold text-slate-200">{title}</h3>
                </div>
                {refreshing && (
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                {files.length === 0 ? (
                    <div className="text-center py-10 text-slate-600 italic">
                        {emptyMessage}
                    </div>
                ) : (
                    files.map((file) => (
                        <div
                            key={file.RowKey}
                            className="group p-4 bg-slate-800/30 rounded-xl hover:bg-slate-700/40 transition-colors border border-transparent hover:border-slate-600/50"
                        >
                            <div className="flex items-start justify-between">
                                <div className="min-w-0 flex-1">
                                    <p className="font-medium text-slate-200 truncate pr-2" title={file.OriginalFileName}>
                                        {file.OriginalFileName}
                                    </p>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                        <span>{formatSize(file.FileSize)}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                                        <span>{formatDate(file.UploadedAt)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                <a
                                    href={`/api/download/${file.RowKey}`}
                                    className="text-xs px-3 py-1.5 bg-blue-600/20 text-blue-300 hover:bg-blue-600/40 rounded-lg transition-colors"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Download
                                </a>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default UploadList;

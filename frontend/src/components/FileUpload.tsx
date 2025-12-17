import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadFile } from '../api';
import type { UploadResponse } from '../types';

interface FileUploadProps {
    onUploadSuccess: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];
        setUploading(true);
        setProgress(0);
        setError(null);
        setUploadResult(null);

        try {
            const result = await uploadFile(file, 24, (p) => setProgress(p));
            setUploadResult(result);
            onUploadSuccess();
        } catch (err) {
            console.error(err);
            setError('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    }, [onUploadSuccess]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, maxFiles: 1 });

    return (
        <div className="w-full max-w-xl mx-auto p-6 glass-panel transition-all duration-300 hover:shadow-2xl hover:border-white/20">
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Upload File
            </h2>

            {!uploadResult ? (
                <div
                    {...getRootProps()}
                    className={`flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-200 outline-none
            ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/50'}
          `}
                >
                    <input {...getInputProps()} />

                    <div className="mb-4 p-4 rounded-full bg-slate-800/80 text-blue-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                        </svg>
                    </div>

                    {isDragActive ? (
                        <p className="text-blue-200 font-medium">Drop the file here...</p>
                    ) : (
                        <div className="text-center">
                            <p className="text-slate-300 font-medium text-lg">Drag & drop a file here</p>
                            <p className="text-slate-500 text-sm mt-1">or click to select one</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center p-8 bg-green-500/10 rounded-xl border border-green-500/20">
                    <div className="mb-4 inline-flex p-3 rounded-full bg-green-500/20 text-green-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-green-300 mb-2">Upload Complete!</h3>
                    <p className="text-slate-400 mb-4">{uploadResult.file_name} is ready.</p>

                    <a
                        href={uploadResult.download_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium shadow-lg shadow-blue-900/20"
                    >
                        Download File
                    </a>

                    <button
                        onClick={() => setUploadResult(null)}
                        className="block mx-auto mt-6 text-slate-500 hover:text-slate-300 text-sm underline"
                    >
                        Upload another file
                    </button>
                </div>
            )}

            {uploading && (
                <div className="mt-8">
                    <div className="flex justify-between text-sm mb-2 text-slate-400">
                        <span>Uploading...</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                        <div
                            className="bg-blue-500 h-2.5 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {error && (
                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                    {error}
                </div>
            )}
        </div>
    );
};

export default FileUpload;

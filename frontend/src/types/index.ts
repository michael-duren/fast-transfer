export interface UploadResponse {
    transfer_id: string;
    download_url: string;
    expires_at: string;
    file_name: string;
    file_size: number;
}

export interface FileMetadata {
    RowKey: string; // Transfer ID
    PartitionKey: string;
    OriginalFileName: string;
    BlobName: string;
    FileSize: number;
    ContentType: string;
    UploadedAt: string;
    ExpiresAt: string;
    DownloadCount: number;
}

from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from app.services.storage import BlobStorageService
from app.services.metadata import TableMetadataService
from app.config import settings
import uuid
import os
from datetime import datetime, timedelta

router = APIRouter()


@router.post("/api/upload")
async def upload_file(file: UploadFile = File(...), expiration_hours: int = Form(24)):
    # 1. Validation
    # Check size (approximate using content-length header if available, or read chunks)
    # Here we assume client-side or reverse proxy limits for strict enforcement,
    # but we can check Content-Length header.

    # Check extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext in [".exe", ".dll", ".sh", ".bat"]:
        raise HTTPException(status_code=400, detail="File type not allowed")

    # 2. Generate IDs
    transfer_id = str(uuid.uuid4())
    blob_name = f"{uuid.uuid4()}{ext}"

    # 3. Upload to Blob Storage
    storage_service = BlobStorageService()
    try:
        blob_url = await storage_service.upload_file(file, blob_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

    # 4. Save Metadata
    metadata_service = TableMetadataService()

    file_size = (
        0  # In a real scenario, we'd count bytes read or use file.size (if spooled)
    )
    # file.size might not be accurate if it's a stream, relying on UploadFile behavior
    # We can get size from the file object if it's spooled to disk/memory
    file.file.seek(0, 2)
    file_size = file.file.tell()

    expires_at = datetime.utcnow() + timedelta(hours=expiration_hours)

    metadata = {
        "PartitionKey": datetime.utcnow().strftime("%Y-%m-%d"),
        "RowKey": transfer_id,
        "OriginalFileName": file.filename,
        "BlobName": blob_name,
        "FileSize": file_size,
        "ContentType": file.content_type,
        "UploadedAt": datetime.utcnow(),
        "ExpiresAt": expires_at,
        "DownloadCount": 0,
    }

    try:
        metadata_service.save_metadata(metadata)
    except Exception as e:
        # TODO: Rollback blob upload if metadata fails
        raise HTTPException(status_code=500, detail=f"Metadata save failed: {str(e)}")

    return {
        "transfer_id": transfer_id,
        "download_url": f"/api/download/{transfer_id}",  # Placeholder until download endpoint exists
        "expires_at": expires_at.isoformat(),
        "file_name": file.filename,
        "file_size": file_size,
    }

@router.get("/api/recent")
async def get_recent_uploads(limit: int = 10):
    metadata_service = TableMetadataService()
    results = metadata_service.get_recent_uploads(limit=limit)
    return results

@router.get("/api/expiring")
async def get_expiring_uploads(limit: int = 10):
    metadata_service = TableMetadataService()
    results = metadata_service.get_expiring_uploads(limit=limit)
    return results

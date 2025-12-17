import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
from app.main import app
import os

client = TestClient(app)

@pytest.fixture
def mock_blob_service():
    with patch("app.routers.upload.BlobStorageService") as mock:
        service_instance = mock.return_value
        service_instance.upload_file.return_value = "https://mock.blob.core.windows.net/uploads/test.txt"
        yield service_instance

@pytest.fixture
def mock_table_service():
    with patch("app.routers.upload.TableMetadataService") as mock:
        service_instance = mock.return_value
        yield service_instance

def test_upload_file_success(mock_blob_service, mock_table_service):
    # Mock file
    files = {'file': ('test.txt', b"Hello World", 'text/plain')}
    
    response = client.post("/api/upload", files=files, data={"expiration_hours": 24})
    
    assert response.status_code == 200
    data = response.json()
    assert "transfer_id" in data
    assert "download_url" in data
    assert data["file_name"] == "test.txt"
    
    # Verify services were called
    mock_blob_service.upload_file.assert_called_once()
    mock_table_service.save_metadata.assert_called_once()
    
    # Check metadata args
    metadata_call_args = mock_table_service.save_metadata.call_args[0][0]
    assert metadata_call_args["OriginalFileName"] == "test.txt"
    assert metadata_call_args["PartitionKey"] is not None
    assert metadata_call_args["RowKey"] == data["transfer_id"]

def test_upload_file_invalid_extension(mock_blob_service, mock_table_service):
    files = {'file': ('malware.exe', b"exec", 'application/x-msdownload')}
    
    response = client.post("/api/upload", files=files)
    
    assert response.status_code == 400
    assert "File type not allowed" in response.json()["detail"]
    
    mock_blob_service.upload_file.assert_not_called()


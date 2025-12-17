from azure.storage.blob import BlobServiceClient
from fastapi import UploadFile
from app.config import settings


class BlobStorageService:
    def __init__(self):
        self.blob_service_client = BlobServiceClient.from_connection_string(
            settings.AZURE_STORAGE_CONNECTION_STRING
        )
        self.container_name = settings.AZURE_STORAGE_CONTAINER_NAME
        self.container_client = self.blob_service_client.get_container_client(
            self.container_name
        )

    async def upload_file(self, file: UploadFile, blob_name: str) -> str:
        """
        Uploads a file to Azure Blob Storage and returns the blob URL.
        """
        blob_client = self.container_client.get_blob_client(blob_name)

        # Read file content
        content = await file.read()

        # Upload
        blob_client.upload_blob(content, overwrite=True)

        # Reset file pointer for subsequent uses if necessary (though we read it all here)
        await file.seek(0)

        return blob_client.url

from datetime import datetime, UTC, timedelta
from typing import List, Dict, Any

from app.config import settings
from azure.data.tables import TableServiceClient


class TableMetadataService:
    def __init__(self):
        self.table_service_client = TableServiceClient.from_connection_string(
            conn_str=settings.AZURE_STORAGE_CONNECTION_STRING
        )
        self.table_name = settings.AZURE_TABLE_NAME
        self.table_client = self.table_service_client.get_table_client(
            table_name=self.table_name
        )

    def save_metadata(self, transfer_data: dict):
        """
        Saves file transfer metadata to Azure Table Storage.
        """
        # Ensure PartitionKey and RowKey are present
        if "PartitionKey" not in transfer_data:
            transfer_data["PartitionKey"] = datetime.now(UTC).strftime("%Y-%m-%d")

        if "RowKey" not in transfer_data:
            raise ValueError("RowKey (Transfer ID) is required.")

        self.table_client.upsert_entity(entity=transfer_data)

    def get_recent_uploads(self, limit: int = 10):
        """
        Retrieves the most recent uploads.
        Assuming we can query by UploadedAt. Note: Table Storage queries on non-keys can be slow.
        For better performance in real apps, we'd use a secondary index or a different PartitionKey strategy.
        Here we'll simply query all and sort (inefficient for large data, okay for demo).
        """
        # "uploaded_at" is not a standard column, we used "UploadedAt" in the entity.
        # Querying all for this demo.
        entities = self.table_client.query_entities(query_filter="")
        # sorting manually since OData orderby is not always efficient or supported on all fields easily without config
        sorted_entities = sorted(entities, key=lambda x: x.get("UploadedAt", datetime.min), reverse=True)
        return sorted_entities[:limit]

    def get_expiring_uploads(self, limit: int = 10):
        """
        Retrieves uploads that are about to expire (e.g. in the next 24 hours) and haven't expired yet.
        """
        now = datetime.now(UTC)
        tomorrow = now + timedelta(hours=24)
        
        # Filtering for items where ExpiresAt is between now and tomorrow
        # OData filter strings need specific formatting.
        # For simplicity in this demo, accessing all and filtering in memory.
        entities = self.table_client.query_entities(query_filter="")
        
        expiring = []
        for entity in entities:
            expires_at = entity.get("ExpiresAt")
            if expires_at and isinstance(expires_at, datetime):
                 # Ensure expires_at is timezone aware for comparison if needed, or if library returns naive
                 # The Azure SDK usually returns timezone aware datetimes if stored that way.
                if now < expires_at < tomorrow:
                    expiring.append(entity)
        
        # Sort by expiration time (sooner first)
        sorted_expiring = sorted(expiring, key=lambda x: x.get("ExpiresAt"))
        return sorted_expiring[:limit]

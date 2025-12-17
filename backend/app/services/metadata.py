from datetime import datetime, UTC

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

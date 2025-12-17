from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    AZURE_STORAGE_CONNECTION_STRING: str
    AZURE_STORAGE_CONTAINER_NAME: str = "uploads"
    AZURE_TABLE_NAME: str = "FileMetadata"
    MAX_FILE_SIZE_MB: int = 100

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


# TODO: Replace the empty string with your actual Azure Storage connection string.
settings = Settings(AZURE_STORAGE_CONNECTION_STRING="")

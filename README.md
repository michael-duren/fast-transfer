# Azure File Transfer Service

A WeTransfer-style file sharing application built with Python and Azure cloud services for the AZ-204 certification project.

## Project Overview

A web application that allows users to upload files, receive a shareable link, and enable recipients to download files within a time-limited window. Files are stored securely in Azure Blob Storage with automatic expiration.

### Core User Flow

1. User visits the web app
2. User uploads one or more files (drag & drop or file picker)
3. System generates a unique, time-limited download link
4. User shares the link with recipients
5. Recipients can download files until the link expires
6. Expired files are automatically cleaned up

---

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│                 │     │                  │     │                     │
│  React Frontend │────▶│  FastAPI Backend │────▶│  Azure Blob Storage │
│                 │     │  (App Service)   │     │                     │
└─────────────────┘     └──────────────────┘     └─────────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │                  │
                        │  Azure Functions │
                        │  (Cleanup Timer) │
                        │                  │
                        └──────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │                  │
                        │ Azure Table/Cosmos│
                        │   (Metadata)     │
                        │                  │
                        └──────────────────┘
```

### Azure Services Used (AZ-204 Relevant)

| Service                          | Purpose                       | AZ-204 Topic                            |
| -------------------------------- | ----------------------------- | --------------------------------------- |
| Azure Blob Storage               | File storage                  | Develop solutions that use Blob storage |
| Azure App Service                | Host FastAPI backend          | Create Azure App Service web apps       |
| Azure Functions                  | Timer-triggered cleanup       | Implement Azure Functions               |
| Azure Table Storage or Cosmos DB | File metadata & link tracking | Develop solutions that use Cosmos DB    |
| SAS Tokens                       | Secure, time-limited access   | Implement secure cloud solutions        |
| Azure Key Vault                  | Store connection strings      | Implement secure cloud solutions        |
| Application Insights             | Monitoring & logging          | Monitor, troubleshoot, and optimize     |

---

## Tech Stack

### Backend

- **Python 3.11+**
- **FastAPI** - Modern async web framework
- **azure-storage-blob** - Blob Storage SDK
- **azure-data-tables** - Table Storage SDK (or azure-cosmos)
- **python-multipart** - File upload handling
- **uvicorn** - ASGI server

### Frontend

- **React** with TypeScript
- **Tailwind CSS** - Styling
- **react-dropzone** - Drag & drop uploads
- **axios** - HTTP client

### Infrastructure

- **Azure CLI** - Deployment
- **Docker** - Containerization
- **GitHub Actions** - CI/CD

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/michael-duren/fast-transfer
   ```
2. Create a virtual environment and install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   pip install -r requirements.txt
   ```
3. Set up Azure resources (Blob Storage, App Service, Functions, Table/Cosmos DB
   using the Azure Portal or Azure CLI.

4. Configure environment variables for connection strings and settings.
   Check `.env.example` for reference.

5. Run the FastAPI backend:
   ```bash
    uvicorn app.main:app --reload
   ```
6. Start the React frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
7. Access the application at `http://localhost:5173`.

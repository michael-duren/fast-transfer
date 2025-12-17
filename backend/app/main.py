from fastapi import FastAPI
from app.routers import upload

app = FastAPI(title="Azure File Transfer Service")

app.include_router(upload.router)

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "Azure File Transfer Service"}

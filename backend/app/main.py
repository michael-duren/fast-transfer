from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import upload

app = FastAPI(title="Azure File Transfer Service")

origins = [
    "http://localhost",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "Azure File Transfer Service"}

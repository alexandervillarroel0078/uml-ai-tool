from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import ALLOWED_ORIGINS
from .routers import auth, uml

app = FastAPI(title="UML AI Tool API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

app.include_router(auth.router)
app.include_router(uml.router)

@app.get("/health")
def health():
    return {"ok": True}

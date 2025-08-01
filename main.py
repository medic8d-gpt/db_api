from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import incidents

app = FastAPI()

# Enable CORS - allow all origins for now (restrict in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the incidents router under /incidents
app.include_router(incidents.router, prefix="/incidents")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.routes_router import router as routes_router
from .api.places_router import router as places_router
from .api.reports_router import router as reports_router
from .api.events_router import router as events_router
from .api.search_router import router as search_router

app = FastAPI(
    title="AccessRoute Live™ API",
    description="Intelligent Accessibility Routing, Crowdsourced Verification & Turn-by-Turn GIS Engine",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes_router, prefix="/api")
app.include_router(places_router, prefix="/api")
app.include_router(reports_router, prefix="/api")
app.include_router(events_router, prefix="/api")
app.include_router(search_router, prefix="/api")

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "AccessRoute Live GIS Backend",
        "version": "1.0.0",
        "modes_supported": [
            "walking", "wheelchair", "vision", "bicycle", "scooter", "pram_elderly"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

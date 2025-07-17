from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import quizzes, ai, share, user, analytics
from .core.config import settings

app = FastAPI(
    title="Personality Spark API",
    description="AI-powered personality quiz platform",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(quizzes.router, prefix="/api/v1")
app.include_router(ai.router, prefix="/api/v1")
app.include_router(share.router, prefix="/api/v1")
app.include_router(user.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Welcome to Personality Spark API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
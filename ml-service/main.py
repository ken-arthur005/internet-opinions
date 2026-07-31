from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pipeline import run
from sentiment import analyze

app = FastAPI()

class BrandRequest(BaseModel):
    brand: str

class TextRequest(BaseModel):
    text: str

@app.post("/collect")
def collect(request: BrandRequest):
    try:
        run(request.brand)
        return {"status": "success", "brand": request.brand}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze")
def analyze_text(request: TextRequest):
    result = analyze(request.text)
    return result

@app.get("/health")
def health():
    return {"status": "ok"}
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://ai-data-analyzer.netlify.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
def read_root():
    return {"message": "AI Data Analyzer is running 🚀"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    df = pd.read_csv(file.file)

    rows, cols = df.shape
    dtypes = {col: str(dtype) for col, dtype in df.dtypes.items()}
    missing_values = df.isnull().sum().to_dict()
    preview = df.head(5).fillna("").to_dict(orient="records")
    numeric_summary = df.describe().fillna("").to_dict()

    return {
        "filename": file.filename,
        "rows": rows,
        "columns": cols,
        "column_names": list(df.columns),
        "data_types": dtypes,
        "missing_values": missing_values,
        "preview": preview,
        "numeric_summary": numeric_summary
    }
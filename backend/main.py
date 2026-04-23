from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

app = FastAPI()

# ✅ Allow both local dev + Netlify frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://ai-data-analyzer.netlify.app"
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
    # Read CSV file
    df = pd.read_csv(file.file)

    # Basic info
    rows, cols = df.shape

    # Data types
    dtypes = {col: str(dtype) for col, dtype in df.dtypes.items()}

    # Missing values
    missing_values = df.isnull().sum().to_dict()

    # Preview first 5 rows
    preview = df.head(5).fillna("").to_dict(orient="records")

    # Summary statistics for numeric columns
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
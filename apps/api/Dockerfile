# Use slim Python image for smaller size
FROM python:3.12-slim

WORKDIR /app

# Install dependencies first (better caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all application code
COPY . .

WORKDIR /app/src

# Use PORT env var from Railway (defaults to 8000)
CMD python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}

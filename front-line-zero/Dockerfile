# Use official Python image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    ENVIRONMENT=production

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Create necessary directories
RUN mkdir -p /app/data/mock/sentinel_samples \
    && mkdir -p /app/data/mock/drone_samples \
    && mkdir -p /app/data/processed

# Expose port
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "src.api.routes:app", "--host", "0.0.0.0", "--port", "8000"]
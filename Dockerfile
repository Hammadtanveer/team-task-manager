FROM node:20-slim

WORKDIR /app

# Install Python and pip
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv && rm -rf /var/lib/apt/lists/*

# Copy everything
COPY . .

# Build frontend
RUN cd frontend && npm install && npm run build

# Install Python dependencies
RUN cd backend && pip3 install -r requirements.txt --break-system-packages

EXPOSE 8000

CMD cd backend && uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}

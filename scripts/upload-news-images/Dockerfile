FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY *.py .
COPY pipeline/ pipeline/

ENV PYTHONUNBUFFERED=1

CMD ["python", "run_pipeline.py"]

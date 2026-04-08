FROM python:3.12-slim

# Set work directory
WORKDIR /usr/src/app

# Environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install system dependencies
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y build-essential libpq-dev curl && \
    rm -rf /var/lib/apt/lists/*

# Install pipenv
RUN pip install --no-cache-dir pipenv

# Copy dependency files
COPY ./Pipfile ./Pipfile.lock ./

# Install Python dependencies
RUN pipenv install --system --deploy --ignore-pipfile

# Copy project code
COPY . .

# Default command for development
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
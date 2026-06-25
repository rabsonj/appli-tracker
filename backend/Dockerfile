FROM python:3.14-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN pip install pipenv

COPY Pipfile Pipfile.lock ./
RUN pipenv install --deploy --system

COPY . .

RUN python manage.py collectstatic --noinput

from a2wsgi import ASGIMiddleware
from API.main import app  # main.py where FastAPI() is defined

application = ASGIMiddleware(app)

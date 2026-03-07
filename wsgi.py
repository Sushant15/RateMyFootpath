from a2wsgi import ASGIMiddleware
from api.main import app  # main.py where FastAPI() is defined

application = ASGIMiddleware(app)

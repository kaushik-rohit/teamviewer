from flask import Flask
from teamviewer import config
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS, cross_origin

app = Flask(__name__)
CORS(app)

app.config.from_object(config.Config)
db = SQLAlchemy(app)

from teamviewer import routes, models
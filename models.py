from teamviewer import db


class Log(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.String(64), index=True, unique=True)
    message = db.Column(db.String(64), index=True)
    author = db.Column(db.String(64), index=True)

    def __repr__(self):
        return '<Log {}{}>'.format(self.id, self.timestamp)



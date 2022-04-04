import sqlite3
from flask import Flask, jsonify, request, send_from_directory
from flask_bs4 import Bootstrap
from flask_cors import CORS

app = Flask(__name__)
app.config['SECRET_KEY'] = '$92ji21uoh98'
app.config['JSON_AS_ASCII'] = False

bootstrap = Bootstrap(app)
CORS(app)

@app.route('/')
def index():
    return "To jest początek tej strony, testuję tylko GITa"


@app.route('/getAllUsers', methods=["GET", "POST"])
def getAllUsers():
    return {'dziala': "tak"}


@app.route('/getArticleData', methods=["GET", "POST"])
def getArticleData():
    id = request.args.get("id")
    if (id == None):
        return {
            "error_message": "Nie podano id artykułu"
        }

    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()
    dbCursor.execute(f"""
        SELECT * FROM articles WHERE `id` = {id}
    """)

    fetchedRecords = dbCursor.fetchall()

    if len(fetchedRecords) == 1:
        articleData = fetchedRecords[0]
        print(articleData)
        return {
            "id": articleData[0],
            "title": articleData[1],
            "subtitle": articleData[2],
            "content": articleData[3],
            "image_url": articleData[4],
            "creation_date": articleData[5]
        }

    else:
        return {
            "error_message": "Taki artykuł nie istnieje"
        }


@app.route('/flask')
def Flask():
    return send_from_directory("../frontend/svelte/public", "index.html")

# Path for all the static files (compiled JS/CSS, etc.)
@app.route("/<path:path>")
def home(path):
    return send_from_directory('../frontend/svelte/public', path)

if __name__ == '__main__':
    app.run(debug=True)

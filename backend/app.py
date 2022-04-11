import sqlite3
from flask import Flask, jsonify, request, send_from_directory
from flask_bs4 import Bootstrap
from flask_cors import CORS

app = Flask(__name__)
app.config['SECRET_KEY'] = '$92ji21uoh98'
app.config['JSON_AS_ASCII'] = False

bootstrap = Bootstrap(app)
CORS(app)

# / - zwraca stronę główną
# /getAllUsers - obecnie służy jako test, później może coś będzie robiło
# /getArticleData - zwraca dane artykułu o podanym ID (?id=ID)
# /getSliderData - zwraca dane slajdera o podanym ID (?id=ID)
# /getFeaturetteData - zwraca dane featuretta o podanym ID (?id=ID)
# /getLatestArticlesIDs - zwraca listę ID X danych artykyłów (gdy ?count=X) lub wszystkich artykułów (gdy ?count=0 lub bez ?count)
# /getLinks - zwraca dane linków dla podanego komponentu
# (?component=header lub ?component=footer)
# /getGalleryData - zwraca dane galerii o podanym ID (?id=ID)
# /getCategoryData - zwraca dane kategorii o podanym ID (?id=ID)



@app.route('/')
def index():
    return send_from_directory("../frontend/svelte/public", "index.html")


@app.route('/article')
def article():
    return send_from_directory("../frontend/svelte/public", "article.html")


@app.route('/getAllUsers', methods=["GET", "POST"])
def getAllUsers():
    return {'dziala': "tak"}


@app.route('/getArticleData', methods=["GET", "POST"])
def getArticleData():
    id = request.args.get("id")
    if id == None or id == "null":
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
            "creation_date": articleData[5],
            "connected_gallery_id": articleData[6],
            "category_id": articleData[7]
        }

    else:
        return {
            "error_message": "Taki artykuł nie istnieje"
        }


@app.route('/getSliderData', methods=["GET", "POST"])
def getSliderData():
    id = request.args.get("id")
    if (id == None):
        return {
            "error_message": "Nie podano id slidera"
        }

    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()
    dbCursor.execute(f"""
        SELECT * FROM sliders WHERE `id` = {id}
    """)
    fetchedSliders = dbCursor.fetchall()

    
    if len(fetchedSliders) == 1:
        slider = fetchedSliders[0]
        dbCursor.execute(f"""
        SELECT * FROM slides WHERE `slider_id` = {id}
        """)
        fetchedSlides = dbCursor.fetchall()
        print(fetchedSlides)

        slides = []

        for slide in fetchedSlides:
            if slide[6] == 0:
                showButton = False
            else:
                showButton = True

            slides.append({
                "id": slide[0],
                "img_url": slide[2],
                "order": slide[3],
                "title": slide[4],
                "subtitle": slide[5],
                "show_button": showButton,
                "button_text": slide[7],
                "button_url": slide[8],
            })

        return {
            "id": slider[0],
            "name": slider[1],
            "slides": slides
        }

    else:
        return {
            "error_message": "Taki slider nie istnieje"
        }


@app.route('/getFeaturetteData', methods=["GET", "POST"])
def getFeaturetteData():
    id = request.args.get("id")
    if (id == None):
        return {
            "error_message": "Nie podano id featuretta"
        }

    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()
    dbCursor.execute(f"""
        SELECT * FROM featurettes WHERE `id` = {id}
    """)
    fetchedFeaturettes = dbCursor.fetchall()

    
    if len(fetchedFeaturettes) == 1:
        featurette = fetchedFeaturettes[0]
        print(featurette)

        return {
            "title": featurette[1],
            "subtitle": featurette[2],
            "content": featurette[3],
            "img_url": featurette[4]
        }

    else:
        return {
            "error_message": "Taki featurette nie istnieje"
        }


@app.route('/getLatestArticlesIDs', methods=["GET", "POST"])
def getLatestArticles():
    count = request.args.get("count")

    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()

    if count == None or count == 0:
        dbCursor.execute(f"""
            SELECT id FROM articles
        """)
    else:
        dbCursor.execute(f"""
            SELECT id FROM articles LIMIT {count}
        """)
    
    fetchedArticlesIDs = dbCursor.fetchall()
    ids = []

    for id in fetchedArticlesIDs:
        ids.append(id[0])

    return {
        "latestArticlesIDs": ids
    }


@app.route('/getLinks', methods=["GET", "POST"])
def getLinks():
    component = request.args.get("component")

    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()

    if component == None:
        return {"error_message": "brak sprecyzowanego komponentu"}
    else:
        dbCursor.execute(f"""
            SELECT * FROM nav_links WHERE `for_component` = "{component}" ORDER BY `order`
        """)

    fetchedLinks = dbCursor.fetchall()
    dbConnection.close()

    links = []

    for link in fetchedLinks:
        links.append({
            "url": link[1],
            "text": link[2]
        })

    print(links)

    
    return jsonify(links)


@app.route('/getGalleryData', methods=["GET", "POST"])
def getGalleryData():
    id = request.args.get("id")
    if (id == None):
        return {
            "error_message": "Nie podano id galerii"
        }

    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()
    dbCursor.execute(f"""
        SELECT * FROM galleries WHERE `id` = {id}
    """)
    fetchedGalleries = dbCursor.fetchall()
    dbConnection.close()

    if len(fetchedGalleries) > 0:
        gallery = fetchedGalleries[0]

        dbConnection = sqlite3.connect('db.sqlite')
        dbCursor = dbConnection.cursor()
        dbCursor.execute(f"""
            SELECT * FROM galleries_photos WHERE `gallery_id` = {gallery[0]}
        """)

        fetchedPhotos = dbCursor.fetchall()
        print(fetchedPhotos)
        dbConnection.close()

        photos = []
        for photo in fetchedPhotos:
            photos.append({
                "img_url": photo[2],
                "description": photo[3]
            })

        return {
            "name": gallery[1],
            "photos": photos
        }

    else:
        return {
            "error_message": "Taka galeria nie istnieje"
        }

@app.route('/getCategoryData', methods=["GET", "POST"])
def getCategoryData():
    id = request.args.get("id")
    if (id == None):
        return {
            "error_message": "Nie podano id galerii"
        }

    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()
    dbCursor.execute(f"""
        SELECT * FROM galleries WHERE `id` = {id}
    """)
    fetchedGalleries = dbCursor.fetchall()
    dbConnection.close()

    if len(fetchedGalleries) > 0:
        gallery = fetchedGalleries[0]

        dbConnection = sqlite3.connect('db.sqlite')
        dbCursor = dbConnection.cursor()
        dbCursor.execute(f"""
            SELECT * FROM galleries_photos WHERE `gallery_id` = {gallery[0]}
        """)

        fetchedPhotos = dbCursor.fetchall()
        print(fetchedPhotos)
        dbConnection.close()

        photos = []
        for photo in fetchedPhotos:
            photos.append({
                "img_url": photo[2],
                "description": photo[3]
            })

        return {
            "name": gallery[1],
            "photos": photos
        }

    else:
        return {
            "error_message": "Taka galeria nie istnieje"
        }



@app.route("/uploads/<path:path>")
def uploads(path):
    return send_from_directory('../frontend/uploads', path)

# Path for all the static files (compiled JS/CSS, etc.)
@app.route("/<path:path>")
def home(path):
    return send_from_directory('../frontend/svelte/public', path)



if __name__ == '__main__':
    app.run(debug=True)

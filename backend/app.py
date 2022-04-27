import json
import sqlite3
from flask import Flask, jsonify, make_response, redirect, request, send_from_directory, session
from flask_bs4 import Bootstrap
from flask_cors import CORS

app = Flask(__name__)
app.config['SECRET_KEY'] = '$92ji21uoh98'
app.config['JSON_AS_ASCII'] = False

bootstrap = Bootstrap(app)
CORS(app)

# /getAllUsers - obecnie służy jako test, później może coś będzie robiło
# /getArticleData - zwraca dane artykułu o podanym ID (?id=ID)
# /getSliderData - zwraca dane slajdera o podanym ID (?id=ID)
# /getFeaturetteData - zwraca dane featuretta o podanym ID (?id=ID)
# /getLatestArticlesIDs - zwraca listę ID X danych artykyłów (gdy ?count=X) lub wszystkich artykułów (gdy ?count=0 lub bez ?count)
# /getLinks - zwraca dane linków dla podanego komponentu (?component=header lub ?component=footer)
# /getGalleryData - zwraca dane galerii o podanym ID (?id=ID)
# /getCategoryData - zwraca dane kategorii o podanym ID (?id=ID)
# /getCommentsForArticle - zwraca komentarze dla artykułu o podanym ID (?id=ID)
# /loginUser - logowanie użytkownika
# /logutUser - wylogowywanie użytkownika
# /getLoggedUserData - zwraca dane zalogowanego użytkownika (lub informację o tym, że nie zalogowano)
# /submitComment - dodawanie komentarza do artykułu
# /switchDarkMode - zmienia cookie z ciemnym motywem

# nie wszystkie endpointy są tu opisane!



@app.route('/')
def index():
    return send_from_directory("../frontend/svelte/public", "index.html")

@app.route('/article')
def article():
    return send_from_directory("../frontend/svelte/public", "article.html")

@app.route('/category')
def category():
    return send_from_directory("../frontend/svelte/public", "category.html")

@app.route('/login')
def login():
    if "userID" in session:
        return redirect("/")
    else:
        return send_from_directory("../frontend/svelte/public", "loginPage.html")

@app.route('/register')
def register():
    if "userID" in session:
        return redirect("/")
    else:
        return send_from_directory("../frontend/svelte/public", "registerPage.html")


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
    categoryId = request.args.get("id")

    if (categoryId == None):
        return {
            "error_message": "Nie podano id kategorii"
        }

    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()
    dbCursor.execute(f"""
        SELECT * FROM categories WHERE `id` = {categoryId}
    """)

    fetchedCategories = dbCursor.fetchall()

    if len(fetchedCategories) > 0:
        dbCursor.execute(f"""
            SELECT `id` FROM articles WHERE `category_id` = {categoryId}
        """)
        fetchedArticles = dbCursor.fetchall()

        dbConnection.close()
        articlesIDs = []

        for fetchedArticle in fetchedArticles:
            articlesIDs.append(fetchedArticle[0])

        return {
            "name" : fetchedCategories[0][1],
            "articles": articlesIDs
        }
    else:
        dbConnection.close()
        return {
            "error_message": "brak kategorii o podanym id"
        }
        

@app.route("/getCommentsForArticle", methods=["POST", "GET"])
def getCommentsForArticle():
    articleId = request.args.get("id")

    if (articleId == None):
        return {
            "error_message": "Nie podano id artykułu"
        }

    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()
    dbCursor.execute(f"""
        SELECT * FROM comments WHERE `article_id` = {articleId}
    """)
    
    fetchedComments = dbCursor.fetchall()

    comments = []

    for fetchedComment in fetchedComments:
        author = ""

        dbCursor.execute(f"""
            SELECT `username` FROM users WHERE `id` = {fetchedComment[2]}
        """)
        fetchedUsers = dbCursor.fetchall()

        if len(fetchedUsers) == 1:
            author = fetchedUsers[0][0]

        comments.append({
            "author": author,
            "creation_date": fetchedComment[3],
            "content": fetchedComment[4]
        })

    dbConnection.close()

    return jsonify(comments)


@app.route("/loginUser", methods=["POST", "GET"])
def loginUser():
    login = request.json.get("firstCredential")
    password = request.json.get("password")

    if login == "" or password == "":
        return {
            "error_message": "Uzupełnij dane logowania!"
        }

    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()
    dbCursor.execute(f"""
        SELECT * FROM users WHERE `username` = "{login}" OR `email` = "{login}"
    """)

    fetchedUsers = dbCursor.fetchall()
    dbConnection.close()

    if len(fetchedUsers) == 1:
        if password == fetchedUsers[0][2]:
            session["userID"] = fetchedUsers[0][0]
            session["userName"] = fetchedUsers[0][1]
            session["userRole"] = fetchedUsers[0][4]

            return {
                "state": "valid"
            }

    return {
        "state": "error",
        "error_message": "Nieprawidłowy, email, nazwa użytkownika lub hasło"
    }


@app.route("/logoutUser", methods=["POST", "GET"])
def logoutUser():
    if "userID" in session:
        del session["userID"]
        del session["userName"]
        del session["userRole"]

    return redirect("/")


@app.route("/getLoggedUserData", methods=["POST"])
def getLoggedUserData():
    if "userName" in session:
        return {
            "userID": session["userID"],
            "userName": session["userName"],
            "userRole": session["userRole"],
        }
    else:
        return {
            "error_message": "brak zalogowanego użytkownika"
        }
        

@app.route("/registerUser", methods=["POST", "GET"])
def registerUser():
    email = request.json.get("email")
    username = request.json.get("username")
    password = request.json.get("password")
    passwordConf = request.json.get("passwordConf")

    if username == "" or password == "" or email == "":
        return {
            "error_message": "Uzupełnij wszystkie dane do rejestracji!"
        }
    
    if passwordConf != password:
        return {
            "error_message": "Podane hasła nie są identyczne!"
        }

    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()
    dbCursor.execute(f"""
        SELECT * FROM users WHERE `username` = "{username}" OR `email` = "{email}"
    """)

    fetchedUsers = dbCursor.fetchall()
    

    if len(fetchedUsers) == 0:


        dbCursor.execute(f"""
               INSERT INTO users 
                (`username`, `password`, `email`, `role`) 
                VALUES
                ("{username}", "{password}", "{email}", "user")
        """)

        dbConnection.commit()
        dbConnection.close()

        return {
            "state": "valid"
        }
    else:
        dbConnection.close()
        return {
            "state": "error",
            "error_message": "Podana nazwa użytkownika lub email są już zajęte!"
        }


@app.route("/submitComment", methods=["POST", "GET"])
def submitComment():
    articleID = request.json.get("articleID")
    commentText = request.json.get("commentText")
    
    if commentText == "":
        return {
            "state": "invalid"
        }

    if "userName" in session:
        dbConnection = sqlite3.connect('db.sqlite')
        dbCursor = dbConnection.cursor()
        dbCursor.execute(f"""
            INSERT INTO comments 
            (`article_id`, `user_id`, `creation_date`, `content`) 
            VALUES
            ({articleID}, {session["userID"]}, datetime("now"), "{commentText}")
        """)

        dbConnection.commit()
        dbConnection.close()

        return {
            "state": "valid"
        }
    else:
        return {
            "error_message": "Niezalogowano"
        }

@app.route("/search", methods=["POST", "GET"])
def search():
    text = request.args.get("text")
    print("text", text)

    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()
    dbCursor.execute(f"""
        SELECT `id` FROM articles 
        WHERE `title` LIKE "%{text}%" OR `subtitle` LIKE "%{text}%" OR `content` LIKE "%{text}%"
    """)

    fetchedArticles = dbCursor.fetchall()
    dbConnection.commit()
    dbConnection.close()

    articleIDs = []
    for fetchedArticle in fetchedArticles:
        articleIDs.append(str(fetchedArticle[0]))

    return redirect(f'/results?ids={"".join(articleIDs)}')


@app.route("/results", methods=["POST", "GET"])
def results():
    return send_from_directory('../frontend/svelte/public', "results.html")


@app.route("/switchDarkMode", methods=["POST", "GET"])
def switchDarkMode():
    darkMode = request.cookies.get("darkMode")
    print(darkMode)
    if darkMode:
        print("są cookies")
        res = make_response({
            "darkMode": 1
        })
        res.delete_cookie("darkMode")
        return res
    else:
        print("nie ma")
        res = make_response({
            "darkMode": 0
        })
        res.set_cookie("darkMode", "1")
        return res
    
    
    


@app.route("/uploads/<path:path>")
def uploads(path):
    return send_from_directory('../frontend/uploads', path)

# Path for all the static files (compiled JS/CSS, etc.)
@app.route("/<path:path>")
def home(path):
    return send_from_directory('../frontend/svelte/public', path)



if __name__ == '__main__':
    app.run(debug=True)

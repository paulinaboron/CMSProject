from datetime import datetime
import json
import sqlite3
from flask import Flask, jsonify, make_response, redirect, render_template, request, send_from_directory, session, flash
from flask_cors import CORS
from flask_bs4 import Bootstrap
from flask_wtf import FlaskForm
from wtforms import SelectField, StringField, SubmitField, HiddenField, TextAreaField, PasswordField, EmailField, FileField
from wtforms.validators import DataRequired
from werkzeug.utils import secure_filename
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = '$92ji21uoh98'
app.config['JSON_AS_ASCII'] = False
app.config['UPLOAD_FOLDER'] = "../frontend/uploads"

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
# /getTemplateColors - zwraca kolory dla ustawionego template'u

# nie wszystkie endpointy są tu opisane!


@app.route('/')
def index():
    return send_from_directory("../frontend/svelte/public", "main.html")

@app.route('/article')
def article():
    return send_from_directory("../frontend/svelte/public", "article.html")

@app.route('/allArticles')
def allArticles():
    return send_from_directory("../frontend/svelte/public", "allArticles.html")

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

@app.route('/profile')
def profile():
    return send_from_directory("../frontend/svelte/public", "profile.html")

@app.route("/results")
def results():
    return send_from_directory('../frontend/svelte/public', "results.html")

@app.route("/admin")
def admin():
    if "userID" in session and session["userRole"] == "admin":
        return send_from_directory('../frontend/svelte/public', "admin.html")
    
    return redirect("/")




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
            slides.append({
                "id": slide[0],
                "img_url": slide[2],
                "order": slide[3],
                "title": slide[4],
                "subtitle": slide[5],
            })

        return {
            "id": slider[0],
            "name": slider[1],
            "interval": slider[2],
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
            SELECT * FROM nav_links WHERE `for_component` = "{component}"
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

    if (id == 0):
        return {
            "error_message": "Galeria 0 - brak powiązanej galerii"
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
        "error_message": "Nieprawidłowy email, nazwa użytkownika lub hasło"
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

    if len(articleIDs) > 0:
        return redirect(f'/results?ids={"".join(articleIDs)}')
    else:
        return redirect(f'/results')


@app.route("/switchDarkMode", methods=["POST", "GET"])
def switchDarkMode():
    darkMode = request.cookies.get("darkMode")

    if darkMode:
        res = make_response({
            "darkMode": 1
        })
        res.delete_cookie("darkMode")
        return res
    else:
        res = make_response({
            "darkMode": 0
        })
        res.set_cookie("darkMode", "1")
        return res


@app.route("/getDarkMode", methods=["POST", "GET"])
def getDarkMode():
    darkMode = request.cookies.get("darkMode")
    if darkMode:
        return {
            "darkMode": True
        }
    else:
        return {
            "darkMode": False
        }


@app.route("/getTemplateColors", methods=["POST", "GET"])
def getTemplateColors():
    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()
    dbCursor.execute(f"""
        SELECT `value` FROM globals 
        WHERE `name` LIKE "current_template" 
    """)

    templateID = dbCursor.fetchall()[0][0]

    dbCursor.execute(f"""
        SELECT `bg_color`, `font_color`, `icon_color`, `button_color` FROM templates 
        WHERE `id` = {templateID} 
    """)

    colors = dbCursor.fetchall()[0]

    dbConnection.commit()
    dbConnection.close()

    return {
        "bg_color": colors[0],
        "font_color": colors[1],
        "icon_color": colors[2],
        "button_color": colors[3]
    }


@app.route("/changeUserData", methods=["POST", "GET"])
def changeUserData():
    if not "userID" in session:
        return {
            "state": "invalid",
            "error_message": "Użytkownik niezalogowany"
        }

    userID = session["userID"]
    newEmail = request.json.get("email")
    newPassword = request.json.get("password")
    newPasswordConf = request.json.get("passwordConf")

    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()

    if newEmail != "":
        dbCursor.execute(f"""
            SELECT `id` FROM users WHERE `email` = "{newEmail}"
        """)
        fetchedUsers = dbCursor.fetchall()

        if len(fetchedUsers) > 0:
            return {
                "state": "invalid",
                "error_message": "Podany adres email jest już zajęty!"
            }
    
    if newPassword != newPasswordConf:
        return {
            "state": "invalid",
            "error_message": "Podane hasła nie są takie same!"
        }

    if newPassword != "":
        dbCursor.execute(f"""
            UPDATE `users`
            SET `password` = "{newPassword}"
            WHERE `id` = {userID}
        """)
        dbConnection.commit()
    
    if newEmail != "":
        dbCursor.execute(f"""
            UPDATE `users`
            SET `email` = "{newEmail}"
            WHERE `id` = {userID}
        """)
        dbConnection.commit()

    
    dbConnection.close()
    return {
        "state": "valid"
    }
    

@app.route("/getTemplateNavStyle", methods=["POST", "GET"])
def getTemplateNavStyle():
    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()
    dbCursor.execute(f"""
        SELECT `value` FROM globals 
        WHERE `name` LIKE "current_template" 
    """)

    templateID = dbCursor.fetchall()[0][0]

    dbCursor.execute(f"""
        SELECT `nav_style` FROM templates 
        WHERE `id` = {templateID} 
    """)

    navStyle = dbCursor.fetchall()[0][0]

    dbConnection.commit()
    dbConnection.close()

    return {
        "nav_style": navStyle
    }


@app.route("/getTemplateFont", methods=["POST", "GET"])
def getTemplateFont():
    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()
    dbCursor.execute(f"""
        SELECT `value` FROM globals 
        WHERE `name` LIKE "current_template" 
    """)

    templateID = dbCursor.fetchall()[0][0]

    dbCursor.execute(f"""
        SELECT `font` FROM templates 
        WHERE `id` = {templateID} 
    """)

    font = dbCursor.fetchall()[0][0]

    dbConnection.commit()
    dbConnection.close()

    return {
        "font": font
    }


@app.route("/getTemplateFooterText", methods=["POST", "GET"])
def getTemplateFooterText():
    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()
    dbCursor.execute(f"""
        SELECT `value` FROM globals 
        WHERE `name` LIKE "current_template" 
    """)

    templateID = dbCursor.fetchall()[0][0]

    dbCursor.execute(f"""
        SELECT `footer_text` FROM templates 
        WHERE `id` = {templateID} 
    """)

    footerText = dbCursor.fetchall()[0][0]

    dbConnection.commit()
    dbConnection.close()

    return {
        "footer_text": footerText
    }


@app.route("/getComponentsInCurrentTemplate", methods=["POST", "GET"])
def getComponentsInCurrentTemplate():
    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()
    dbCursor.execute(f"""
        SELECT `value` FROM globals 
        WHERE `name` LIKE "current_template" 
    """)

    templateID = dbCursor.fetchall()[0][0]

    dbCursor.execute(f"""
        SELECT `type`, `dbID`, `order` FROM templates, components, components_in_templates
        WHERE components_in_templates.componentID = components.id AND components_in_templates.templateID = {templateID} and templates.id = {templateID}
        ORDER BY `order`
    """)

    fetch = dbCursor.fetchall()
    records = []

    for record in fetch:
        records.append({
            "type": record[0],
            "dbID": record[1],
            "order": record[2],
        })

    dbConnection.commit()
    dbConnection.close()

    return jsonify(records)




@app.route("/adminGetAllFeaturettes", methods=["POST"])
def adminGetAllFeaturettes():
    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()
    dbCursor.execute(f"""
        SELECT * FROM featurettes
    """)

    featurettes = dbCursor.fetchall()

    return jsonify(featurettes)


@app.route("/adminSaveFeaturette", methods=["POST"])
def adminSaveFeatureatte():
    currID = request.json.get("id")
    title = request.json.get("title")
    subtitle = request.json.get("subtitle")
    content = request.json.get("content")
    imagePath = request.json.get("imagePath")
    
    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()

    if currID == 0:
        dbCursor.execute(f"""
            INSERT INTO featurettes
            (`title`, `subtitle`, `content`, `image_url`)
            VALUES
            ("{title}", "{subtitle}", "{content}", "{imagePath}")
        """)

        dbConnection.commit()

        dbCursor.execute(f"""
            SELECT id FROM featurettes ORDER BY id DESC
        """)

        newDbID = dbCursor.fetchall()[0][0]
        
        dbCursor.execute(f"""
            INSERT INTO components
            (`type`, `dbID`)
            VALUES
            ("featurette", {newDbID})
        """)

        dbConnection.commit()

    else:
        dbCursor.execute(f"""
            UPDATE featurettes
            SET `title` = "{title}", `subtitle` = "{subtitle}", `content` = "{content}", `image_url` = "{imagePath}"
            WHERE
            `id` = {currID}
        """)

        dbConnection.commit()

    
    dbConnection.close()

    return {
        "state": "valid"
    }


@app.route("/adminDeleteFeaturette", methods=["POST"])
def adminDeleteFeaturette():
    currID = request.json.get("id")
    
    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()

    dbCursor.execute(f"""
        DELETE FROM featurettes WHERE `id` = {currID}
    """)

    dbCursor.execute(f"""
        DELETE FROM components WHERE `type` = "featurette" and `dbID` = {currID}
    """)

    dbConnection.commit()
    dbConnection.close()

    return {
        "state": "valid"
    }


@app.route("/adminGetAllArticles", methods=["POST"])
def adminGetAllArticles():
    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()
    dbCursor.execute(f"""
        SELECT * FROM articles
    """)

    articles = dbCursor.fetchall()

    return jsonify(articles)


@app.route("/adminSaveArticle", methods=["POST"])
def adminSaveArticle():
    currID = request.json.get("id")
    title = request.json.get("title")
    subtitle = request.json.get("subtitle")
    content = request.json.get("content")
    connectedGallery = request.json.get("connectedGallery")
    categoryID = request.json.get("categoryID")
    
    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()

    if currID == 0:
        dbCursor.execute(f"""
            INSERT INTO articles
            (`title`, `subtitle`, `content`, `image_url`, `creation_date`, `connected_gallery_id`, `category_id`) 
            VALUES
            ("{title}", "{subtitle}", "{content}", "", datetime("now"), {connectedGallery}, {categoryID})
        """)
    else:
        dbCursor.execute(f"""
            UPDATE articles
            SET `title` = "{title}", `subtitle` = "{subtitle}", `content` = "{content}", `connected_gallery_id` = {connectedGallery}, `category_id` = {categoryID}
            WHERE
            `id` = {currID}
        """)

    dbConnection.commit()
    dbConnection.close()

    return {
        "state": "valid"
    }


@app.route("/adminDeleteArticle", methods=["POST"])
def adminDeleteArticle():
    currID = request.json.get("id")
    
    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()
    dbCursor.execute(f"""
        DELETE FROM articles WHERE `id` = {currID}
    """)
    
    dbCursor.execute(f"""
        DELETE FROM `nav_links` WHERE `link` = "/article?id={currID}"
    """)

    dbConnection.commit()
    dbConnection.close()

    return {
        "state": "valid"
    }


@app.route("/adminGetAllCategories", methods=["POST"])
def adminGetAllCategories():
    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()
    dbCursor.execute(f"""
        SELECT * FROM categories
    """)

    categories = dbCursor.fetchall()

    return jsonify(categories)


@app.route("/adminAddCategory", methods=["POST"])
def adminAddCategory():
    name = request.json.get("name")
    
    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()

    dbCursor.execute(f"""
        INSERT INTO categories
        (`name`) 
        VALUES
        ("{name}")
    """)

    dbConnection.commit()
    dbConnection.close()

    return {
        "state": "valid"
    }


@app.route("/adminDeleteCategory", methods=["POST"])
def adminDeleteCategory():
    currID = request.json.get("id")
    
    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()
    dbCursor.execute(f"""
        DELETE FROM categories WHERE `id` = {currID}
    """)

    dbCursor.execute(f"""
        UPDATE articles SET `category_id` = 0 WHERE `category_id` = {currID}
    """)

    dbCursor.execute(f"""
        DELETE FROM `nav_links` WHERE `link` = "/category?id={currID}"
    """)

    dbConnection.commit()
    dbConnection.close()

    return {
        "state": "valid"
    }


@app.route("/adminSaveCategory", methods=["POST"])
def adminSaveCategory():
    currID = request.json.get("id")
    name = request.json.get("newName")
    
    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()

    dbCursor.execute(f"""
        UPDATE categories SET `name` = "{name}" WHERE `id` = {currID}
    """)

    dbConnection.commit()
    dbConnection.close()

    return {
        "state": "valid"
    }


@app.route("/adminGetAllGalleries", methods=["POST", "GET"])
def adminGetAllGalleries():
    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()
    dbCursor.execute(f"""
        SELECT * FROM galleries
    """)

    galleries = list(dbCursor.fetchall())

    for idx, gallery in enumerate(galleries):
        gallery = list(gallery)
        dbCursor.execute(f"""
            SELECT * FROM galleries_photos WHERE `gallery_id` = {gallery[0]}
        """)

        photos = list(dbCursor.fetchall())

        galleries[idx] = list(galleries[idx])
        galleries[idx].append(photos)


    return jsonify(galleries)


@app.route("/adminSaveGallery", methods=["POST"])
def adminSaveGallery():
    currID = request.json.get("id")
    name = request.json.get("name")
    
        
    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()

    if currID == 0:
        dbCursor.execute(f"""
            INSERT INTO galleries
            (`name`) 
            VALUES
            ("{name}")
        """)
    else:
        dbCursor.execute(f"""
            UPDATE galleries
            SET `name` = "{name}"
            WHERE
            `id` = {currID}
        """)

    dbConnection.commit()
    dbConnection.close()

    return {
        "state": "valid"
    }
        

@app.route("/adminDeleteGallery", methods=["POST"])
def adminDeleteGallery():
    currID = request.json.get("id")
    
    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()
    dbCursor.execute(f"""
        DELETE FROM galleries WHERE `id` = {currID}
    """)

    dbCursor.execute(f"""
        DELETE FROM galleries_photos WHERE `gallery_id` = {currID}
    """)

    dbCursor.execute(f"""
        UPDATE articles SET `connected_gallery_id` = 0 WHERE `category_id` = {currID}
    """)

    dbConnection.commit()
    dbConnection.close()

    return {
        "state": "valid"
    }


@app.route("/adminSavePhoto", methods=["POST"])
def adminSavePhoto():
    currID = request.json.get("id")
    imgPath = request.json.get("newImagePath")
    
    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()

    dbCursor.execute(f"""
        UPDATE galleries_photos SET `img_url` = "{imgPath}" WHERE `id` = {currID}
    """)

    dbConnection.commit()
    dbConnection.close()

    return {
        "state": "valid"
    }
        

@app.route("/adminDeletePhoto", methods=["POST"])
def adminDeletePhoto():
    currID = request.json.get("id")
    
    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()
    dbCursor.execute(f"""
        DELETE FROM galleries_photos WHERE `id` = {currID}
    """)

    dbConnection.commit()
    dbConnection.close()

    return {
        "state": "valid"
    }


@app.route("/adminAddPhoto", methods=["POST"])
def adminAddPhoto():
    galleryID = request.json.get("galleryID")
    imagePath = request.json.get("imagePath")

    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()

    dbCursor.execute(f"""
        INSERT INTO galleries_photos
        (`gallery_id`, `img_url`) 
        VALUES
        ("{galleryID}", "{imagePath}")
    """)

    dbConnection.commit()
    dbConnection.close()

    return {
        "state" : "valid"
    }


@app.route("/adminGetNavLinks", methods=["POST"])
def adminGetNavLinks():
    component = request.json.get("component")
    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()
    dbCursor.execute(f"""
        SELECT * FROM nav_links WHERE `for_component` = "{component}"
    """)

    links = list(dbCursor.fetchall())

    return jsonify(links)


@app.route("/adminDeleteNavLink", methods=["POST"])
def adminDeleteNavLink():
    currID = request.json.get("id")
    
    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()
    dbCursor.execute(f"""
        DELETE FROM nav_links WHERE `id` = {currID}
    """)

    dbConnection.commit()
    dbConnection.close()

    return {
        "state": "valid"
    }


@app.route("/adminSaveNavLink", methods=["POST"])
def adminSaveNavLink():
    currID = request.json.get("id")
    link = request.json.get("link")
    text = request.json.get("text")
    component = request.json.get("component")

    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()
    dbCursor.execute(f"""
        UPDATE nav_links 
        SET `link` = "{link}", `text` = "{text}", `for_component` = "{component}"
        WHERE `id` = {currID}
    """)

    dbConnection.commit()
    dbConnection.close()

    return {
        "state": "valid"
    }


@app.route("/adminAddNavLink", methods=["POST"])
def adminAddNavLink():
    link = request.json.get("link")
    text = request.json.get("text")
    component = request.json.get("component")

    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()
    dbCursor.execute(f"""
        INSERT INTO nav_links
        (`link`, `text`, `for_component`)
        VALUES
        ("{link}", "{text}", "{component}")
    """)

    dbConnection.commit()
    dbConnection.close()

    return {
        "state": "valid"
    }


@app.route("/adminGetAllSliders", methods=["POST", "GET"])
def adminGetAllSliders():
    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()
    dbCursor.execute(f"""
        SELECT * FROM sliders
    """)

    sliders = list(dbCursor.fetchall())

    for idx, slider in enumerate(sliders):
        slider = list(slider)
        dbCursor.execute(f"""
            SELECT * FROM slides WHERE `slider_id` = {slider[0]}
        """)

        photos = list(dbCursor.fetchall())

        sliders[idx] = list(sliders[idx])
        sliders[idx].append(photos)


    return jsonify(sliders)


@app.route("/adminSaveSlider", methods=["POST"])
def adminSaveSlider():
    currID = request.json.get("id")
    name = request.json.get("name")
    interval = request.json.get("interval")
        
    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()

    if currID == 0:
        dbCursor.execute(f"""
            INSERT INTO sliders
            (`name`, `interval`) 
            VALUES
            ("{name}", "{interval}")
        """)

        dbConnection.commit()

        dbCursor.execute(f"""
            SELECT id FROM sliders ORDER BY id DESC
        """)

        newDbID = dbCursor.fetchall()[0][0]
        
        dbCursor.execute(f"""
            INSERT INTO components
            (`type`, `dbID`)
            VALUES
            ("slider", {newDbID})
        """)
        
        dbConnection.commit()

    else:
        dbCursor.execute(f"""
            UPDATE sliders
            SET `name` = "{name}", `interval` = "{interval}"
            WHERE
            `id` = {currID}
        """)

        dbConnection.commit()

    dbConnection.close()

    return {
        "state": "valid"
    }


@app.route("/adminDeleteSlider", methods=["POST"])
def adminDeleteSlider():
    currID = request.json.get("id")
    
    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()
    dbCursor.execute(f"""
        DELETE FROM sliders WHERE `id` = {currID}
    """)

    dbCursor.execute(f"""
        DELETE FROM components WHERE `type` = "slider" and `dbID` = {currID}
    """)

    dbCursor.execute(f"""
        DELETE FROM slides WHERE `slider_id` = {currID}
    """)

    dbConnection.commit()
    dbConnection.close()

    return {
        "state": "valid"
    }


@app.route("/adminSaveSlide", methods=["POST"])
def adminSaveSlide():
    currID = request.json.get("id")
    imgPath = request.json.get("newImagePath")
    title = request.json.get("newTitle")
    subtitle = request.json.get("newSubtitle")
    
    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()

    dbCursor.execute(f"""
        UPDATE slides 
        SET 
        `img_url` = "{imgPath}", `title` = "{title}", `subtitle` = "{subtitle}"
        WHERE `id` = {currID}
    """)

    dbConnection.commit()
    dbConnection.close()

    return {
        "state": "valid"
    }


@app.route("/adminDeleteSlide", methods=["POST"])
def adminDeleteSlide():
    currID = request.json.get("id")
    
    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()
    dbCursor.execute(f"""
        DELETE FROM slides WHERE `id` = {currID}
    """)

    dbConnection.commit()
    dbConnection.close()

    return {
        "state": "valid"
    }


@app.route("/adminAddSlide", methods=["POST"])
def adminAddSlide():
    sliderID = request.json.get("sliderID")
    imagePath = request.json.get("imagePath")
    title = request.json.get("title")
    subtitle = request.json.get("subtitle")

    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()

    dbCursor.execute(f"""
        INSERT INTO slides
        (`slider_id`, `img_url`, `title`, `subtitle`) 
        VALUES
        ("{sliderID}", "{imagePath}", "{title}", "{subtitle}")
    """)

    dbConnection.commit()
    dbConnection.close()

    return {
        "state" : "valid"
    }


@app.route("/adminGetAllComponents", methods=["POST"])
def adminGetAllComponents():
    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()
    dbCursor.execute(f"""
        SELECT * FROM components
    """)

    components = list(dbCursor.fetchall())

    for idx, component in enumerate(components):
        compType = component[1]
        dbID = component[2]
        components[idx] = list(components[idx])

        if compType == "slider":
            dbCursor.execute(f"""
                SELECT name FROM sliders WHERE `id` = {dbID}
            """)

            name = list(dbCursor.fetchall()[0])[0]
            components[idx].append(name)

        if compType == "featurette":
            dbCursor.execute(f"""
                SELECT title FROM featurettes WHERE `id` = {dbID}
            """)

            name = list(dbCursor.fetchall()[0])[0]
            components[idx].append(name)

        if compType == "news":
            components[idx].append("Sekcja newsów")


    dbCursor.close()
    dbConnection.close()

    return jsonify(components)


@app.route("/adminGetAllTemplates", methods=["POST", "GET"])
def adminGetAllTemplates():
    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()
    dbCursor.execute(f"""
        SELECT * FROM templates
    """)

    templates = dbCursor.fetchall()

    for idx, template in enumerate(templates):
        templates[idx] = list(templates[idx])

        dbCursor.execute(f"""
            SELECT * FROM components_in_templates WHERE `templateID` = {template[0]} ORDER BY `order`
        """)

        compsInTemplates = list(dbCursor.fetchall())
        comps = []

        for comp in compsInTemplates:
            
            dbCursor.execute(f"""
                SELECT * FROM components WHERE `id` = {comp[2]}
            """)

            data = list(dbCursor.fetchall()[0])
            data.append(comp[3])
            data.append(comp[4])
        
            if data[1] == "news":
                data.append("Sekcja newsów")

            if data[1] == "slider":
                dbCursor.execute(f"""
                    SELECT name FROM sliders WHERE `id` = {data[2]}
                """)

                name = list(dbCursor.fetchall()[0])[0]
                data.append(name)
                
            if data[1] == "featurette":
                dbCursor.execute(f"""
                    SELECT title FROM featurettes WHERE `id` = {data[2]}
                """)

                name = list(dbCursor.fetchall()[0])[0]
                data.append(name)

            data.append(comp[0])

            comps.append(data)




        templates[idx].append(comps)

    dbConnection.close()

    return jsonify(templates)


@app.route("/adminAddComponent", methods=["POST"])
def adminAddComponent():
    templateID = request.json.get("templateID")
    componentID = request.json.get("componentID")
    name = request.json.get("name")

    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()

    dbCursor.execute(f"""
        SELECT `order` FROM components_in_templates WHERE `templateID` = {templateID} ORDER BY `order` desc
    """)

    newOrder = dbCursor.fetchall()[0][0] + 1

    dbCursor.execute(f"""
        INSERT INTO components_in_templates
        (`templateID`, `componentID`, `order`, `name`)
        VALUES
        ({templateID}, {componentID}, {newOrder}, "{name}")
    """)

    dbConnection.commit()
    dbConnection.close()

    return {
        "state": "valid"
    }


@app.route("/adminSaveComponent", methods=["POST"])
def adminSaveComponent():
    currID = request.json.get("id")
    templateID = request.json.get("templateID")
    componentID = request.json.get("componentID")
    name = request.json.get("name")

    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()

    dbCursor.execute(f"""
        UPDATE components_in_templates
        SET `templateID` = {templateID}, `componentID` = {componentID}, `name` = "{name}"
        WHERE `id` = {currID}
    """)

    dbConnection.commit()
    dbConnection.close()

    return {
        "state": "valid"
    }


@app.route("/adminDeleteComponent", methods=["POST"])
def adminDeleteComponent():
    currID = request.json.get("id")
    order = request.json.get("order")
    templateID = request.json.get("templateID")

    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()

    dbCursor.execute(f"""
        DELETE FROM components_in_templates WHERE `id` = {currID}
    """)

    dbCursor.execute(f"""
        UPDATE components_in_templates 
        SET `order` = `order` - 1
        WHERE `templateID` = {templateID}
        and `order` > {order}
    """)

    dbConnection.commit()
    dbConnection.close()

    return {
        "state": "valid"
    }


@app.route("/adminComponentOrderUp", methods=["POST"])
def adminComponentOrderUp():
    currID = request.json.get("id")
    order = request.json.get("order")
    templateID = request.json.get("templateID")

    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()

    dbCursor.execute(f"""
        UPDATE components_in_templates 
        SET `order` = {order}
        WHERE `templateID` = {templateID}
        and `order` = {order} - 1
    """)

    dbCursor.execute(f"""
        UPDATE components_in_templates 
        SET `order` = `order` - 1
        WHERE `templateID` = {templateID}
        and `id` = {currID}
    """)

    dbConnection.commit()
    dbConnection.close()

    return {
        "state": "valid"
    }


@app.route("/adminComponentOrderDown", methods=["POST"])
def adminComponentOrderDown():
    currID = request.json.get("id")
    order = request.json.get("order")
    templateID = request.json.get("templateID")

    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()

    dbCursor.execute(f"""
        UPDATE components_in_templates 
        SET `order` = {order} 
        WHERE `templateID` = {templateID}
        and `order` = {order} + 1
    """)

    dbCursor.execute(f"""
        UPDATE components_in_templates 
        SET `order` = `order` + 1
        WHERE `templateID` = {templateID}
        and `id` = {currID}
    """)

    dbConnection.commit()
    dbConnection.close()

    return {
        "state": "valid"
    }


@app.route("/adminSaveTemplate", methods=["POST"])
def adminSaveTemplate():
    currID = request.json.get("id")
    name = request.json.get("name")
    bgColor = request.json.get("bgColor")
    fontColor = request.json.get("fontColor")
    buttonColor = request.json.get("buttonColor")
    footerText = request.json.get("footerText")
    navStyle = request.json.get("navStyle")
    fontFamily = request.json.get("fontFamily")

    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()

    if currID != 0:
        dbCursor.execute(f"""
            UPDATE templates
            SET `name` = "{name}", `bg_color` = "{bgColor}", `font_color` = "{fontColor}", `button_color` = "{buttonColor}", `footer_text` = "{footerText}", `nav_style` = "{navStyle}", `font`  = "{fontFamily}"
            WHERE `id` = {currID}
        """)
    else:
        dbCursor.execute(f"""
            INSERT INTO templates
            (`name`, `bg_color`, `font_color`, `icon_color`, `button_color`, `footer_text`, `nav_style`, `font`)
            VALUES
            ("{name}", "{bgColor}", "{fontColor}", "rgba(0,0,0,0.5)", "{buttonColor}", "{footerText}", "{navStyle}", "{fontFamily}")
        """)


    dbConnection.commit()
    dbConnection.close()

    return {
        "state": "valid"
    }


@app.route("/adminDeleteTemplate", methods=["POST"])
def adminDeleteTemplate():
    currID = request.json.get("id")
    
    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()
    dbCursor.execute(f"""
        DELETE FROM templates WHERE `id` = {currID}
    """)

    dbCursor.execute(f"""
        DELETE FROM components_in_templates WHERE `templateID` = {currID}
    """)

    dbConnection.commit()
    dbConnection.close()

    return {
        "state": "valid"
    }


@app.route("/adminUploadFeaturetteImages", methods=["POST"])
def adminUploadFeaturetteImages():
    file = request.files['file']
    filename = secure_filename(file.filename)
    savedFiles = os.listdir('../frontend/uploads/featurettes')

    name = filename.split(".")

    while f"{name[0]}.{name[1]}" in savedFiles:
        name[0] += "_"
    
    filename = f"{name[0]}.{name[1]}"
    
    file.save(os.path.join(f"{app.config['UPLOAD_FOLDER']}/featurettes", filename))
    return {
        "state": "valid"
    }


@app.route("/adminGetFeaturetteImages", methods=["POST"])
def adminGetFeaturetteImages():
    savedFiles = os.listdir('../frontend/uploads/featurettes')

    return jsonify(savedFiles)


@app.route("/adminUploadGalleriesImages", methods=["POST"])
def adminUploadGalleriesImages():
    file = request.files['file']
    filename = secure_filename(file.filename)
    savedFiles = os.listdir('../frontend/uploads/galleries')

    name = filename.split(".")

    while f"{name[0]}.{name[1]}" in savedFiles:
        name[0] += "_"
    
    filename = f"{name[0]}.{name[1]}"
    
    file.save(os.path.join(f"{app.config['UPLOAD_FOLDER']}/galleries", filename))
    return {
        "state": "valid"
    }


@app.route("/adminGetGalleriesImages", methods=["POST"])
def adminGetGalleriesImages():
    savedFiles = os.listdir('../frontend/uploads/galleries')

    return jsonify(savedFiles)


@app.route("/adminUploadSliderImages", methods=["POST"])
def adminUploadSlidersImages():
    file = request.files['file']
    filename = secure_filename(file.filename)
    savedFiles = os.listdir('../frontend/uploads/slider')

    name = filename.split(".")

    while f"{name[0]}.{name[1]}" in savedFiles:
        name[0] += "_"
    
    filename = f"{name[0]}.{name[1]}"
    
    file.save(os.path.join(f"{app.config['UPLOAD_FOLDER']}/slider", filename))
    return {
        "state": "valid"
    }


@app.route("/adminGetSliderImages", methods=["POST"])
def adminGetSlidersImages():
    savedFiles = os.listdir('../frontend/uploads/slider')

    return jsonify(savedFiles)



def getComponentsForFSLinks():
    links = []

    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()

    dbCursor.execute(f"""
        SELECT * FROM articles
    """)
    articles = dbCursor.fetchall()

    dbCursor.execute(f"""
        SELECT * FROM categories
    """)
    categories = dbCursor.fetchall()

    dbConnection.close()

    links.append(["/", "Strona główna"])
    links.append(["/allArticles", "Strona artykułów"])

    for article in articles:
        links.append((f"/article?id={article[0]}", f"{article[1]} (Artykuł, id: {article[0]})"))

    for category in categories:
        links.append([f"/category?id={category[0]}", f"{category[1]} (Kategoria, id: {category[0]})"])
    
    return links

def getGalleriesForArticles():
    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()

    dbCursor.execute(f"""
        SELECT * FROM galleries
    """)
    fetch = dbCursor.fetchall()

    galleries = []
    galleries.append(("0", "*BRAK*"))

    for record in fetch:
        galleries.append((str(record[0]), record[1]))

    return galleries

def getCategoriesForArticles():
    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()

    dbCursor.execute(f"""
        SELECT * FROM categories
    """)
    fetch = dbCursor.fetchall()

    categories = []
    categories.append(("0", "*BRAK*"))

    for record in fetch:
        categories.append((str(record[0]), record[1]))

    return categories

def getAllTemplates():
    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()

    dbCursor.execute(f"""
        SELECT * FROM templates
    """)
    fetch = dbCursor.fetchall()

    templates = []

    for record in fetch:
        templates.append((str(record[0]), f"{record[0]} - {record[1]}"))

    return templates

class editLinkForm(FlaskForm):
    url = SelectField("Strona docelowa", choices=getComponentsForFSLinks)
    text = StringField("Tekst linku")
    submit = SubmitField("Zapisz")
    id = HiddenField("")

class articleForm(FlaskForm):
    title = StringField("Tytuł")
    subtitle = StringField("Podtytuł")
    content = TextAreaField("Treść (/tab/ - akapit, /nl/ - nowa linia)")
    connectedGallery = SelectField("Połączona galeria", choices=getGalleriesForArticles)
    category = SelectField("Kategoria", choices=getCategoriesForArticles)
    submit = SubmitField("Zapisz")
    id = HiddenField("")

class userForm(FlaskForm):
    login = StringField("Login", validators=[DataRequired()])
    email = EmailField("Email", validators=[DataRequired()])
    password = PasswordField("Hasło", validators=[DataRequired()])
    confPassword = PasswordField("Potwierdź hasło", validators=[DataRequired()])
    role = SelectField("Rola", choices=[("user", "Użytkownik"), ("admin", "Administrator")])
    submit = SubmitField("Zapisz")
    id = HiddenField("")

class userEditForm(FlaskForm):
    login = StringField("Login", validators=[DataRequired()])
    email = EmailField("Email", validators=[DataRequired()])
    password = PasswordField("Hasło")
    confPassword = PasswordField("Potwierdź hasło")
    role = SelectField("Rola", choices=[("user", "Użytkownik"), ("admin", "Administrator")])
    submit = SubmitField("Zapisz")
    id = HiddenField("")

class saveTemplate(FlaskForm):
    template = SelectField("Wybrany układ", choices=getAllTemplates)
    submit = SubmitField("Zapisz")


@app.route("/fastSettings")
def fastSettings():
    if "userID" not in session or session["userRole"] != "admin":
        return redirect("/")

    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()

    dbCursor.execute(f"""
            SELECT `value` FROM globals WHERE `name` = "current_template"
        """)

    currentTemplate = dbCursor.fetchone()[0]

    form = saveTemplate()
    form.template.data = currentTemplate

    return render_template("fastSettings.html", title="Fast settings", form=form, currentTemplate=currentTemplate)
    
    
@app.route("/FSSaveTemplate", methods=["POST", "GET"])
def FSSaveTemplate():
    currID = request.form.get("template")

    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()


    dbCursor.execute(f"""
            UPDATE globals SET `value` = "{currID}" WHERE `name` = "current_template"
        """)

    dbConnection.commit()


    dbCursor.execute(f"""
            SELECT * FROM `globals`
        """)

    dbConnection.close()

    return redirect("/fastSettings")


@app.route("/FSExportSettings", methods=["POST", "GET"])
def FSExportSettings():
    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()

    dbCursor.execute(f"""
            SELECT `value` FROM globals WHERE `name` = "current_template"
        """)

    currentTemplate = int(dbCursor.fetchone()[0])

    dbCursor.execute(f"""
            SELECT * FROM templates WHERE id = {currentTemplate}
        """)

    fetch = dbCursor.fetchone()

    settings = {
        "name": fetch[1],
        "bgColor": fetch[2],
        "fontColor": fetch[3],
        "buttonColor": fetch[5],
        "footerText": fetch[6],
        "navStyle": fetch[7],
        "font": fetch[8]
    }

    now = datetime.now().strftime("%d_%m_%Y_%H_%M_%S")
    filename = f"templateSettings_{now}.json"

    res = make_response(jsonify(settings))
    res.headers['Content-Disposition'] = f'attachment;filename={filename}'

    return res


@app.route("/FSImportSettings", methods=["POST", "GET"])
def FSImportSettings():
    if request.files["file"].filename == "":
        return redirect("/fastSettings")

    inp = request.files["file"].read().decode("utf8")
    parsed = json.loads(inp)
    
    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()

    dbCursor.execute(f"""
            SELECT `value` FROM globals WHERE `name` = "current_template"
        """)

    currentTemplate = int(dbCursor.fetchone()[0])

    dbCursor.execute(f"""
        UPDATE templates
        SET `name` = "{parsed["name"]}", `bg_color` = "{parsed["bgColor"]}", `button_color` = "{parsed["buttonColor"]}", 
        `font` = "{parsed["font"]}", `font_color` = "{parsed["fontColor"]}", `footer_text` = "{parsed["footerText"]}",
        "nav_style" = "{parsed["navStyle"]}"
        WHERE `id` = {currentTemplate}
    """)

    dbConnection.commit()
    dbConnection.close()


    return redirect("/admin")


@app.route("/FSNavigation")
def FSNavigation():
    if "userID" not in session or session["userRole"] != "admin":
        return redirect("/")

    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()

    dbCursor.execute(f"""
            SELECT * FROM `nav_links` WHERE `for_component` = "header"
        """)
    fetch = dbCursor.fetchall()

    return render_template("FSNavigation.html", title="Navigation", links=fetch, navLinkOpts=getComponentsForFSLinks())
    

@app.route("/FSFooter")
def FSFooter():
    if "userID" not in session or session["userRole"] != "admin":
        return redirect("/")

    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()

    dbCursor.execute(f"""
            SELECT * FROM nav_links WHERE `for_component` = "footer"
        """)
    fetch = dbCursor.fetchall()

    dbCursor.execute(f"""
            SELECT value FROM globals WHERE `name` = "current_template"
        """)
    currTemplate = dbCursor.fetchone()[0]

    dbCursor.execute(f"""
            SELECT footer_text FROM templates WHERE `id` = {currTemplate}
        """)

    footerText = dbCursor.fetchone()[0]

    return render_template("FSFooter.html", title="Footer", links=fetch, navLinkOpts=getComponentsForFSLinks(), footerText=footerText)


@app.route("/FSFooterSaveText", methods=["POST", "GET"])
def FSFooterSaveText():
    newText = request.form.get("footerText")

    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()

    dbCursor.execute(f"""
            SELECT value FROM globals WHERE `name` = "current_template"
        """)
    currTemplate = dbCursor.fetchone()[0]

    dbCursor.execute(f"""
            UPDATE templates
            SET `footer_text` = "{newText}"
            WHERE `id` = {currTemplate}
        """)
    
    dbConnection.commit()
    dbConnection.close()

    return redirect("/FSFooter")
 

@app.route("/FSEditNavLink")
def FSEditNavLink():
    currID = request.args.get("id")

    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()

    dbCursor.execute(f"""
            SELECT * FROM `nav_links` WHERE `id` = {currID}
        """)
    
    link = dbCursor.fetchall()[0]

    form = editLinkForm()
    form.url.data = link[1]
    form.text.data = link[2]
    form.id.data = link[0]

    return render_template("FSNavigationEditLink.html", title="Link edition", form=form)


@app.route("/FSSaveNavLink", methods=["POST", "GET"])
def FSSaveNavLink():
    currID = request.form.get("id")
    url = request.form.get("url")
    text = request.form.get("text")

    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()

    dbCursor.execute(f"""
            UPDATE `nav_links`
            SET `link` = "{url}", `text` = "{text}"
            WHERE `id` = {currID}
        """)
    
    dbConnection.commit()
    dbConnection.close()

    return redirect("/FSNavigation")


@app.route("/FSAddNavLink", methods=["POST", "GET"])
def FSAddNavLink():
    url = request.form.get("linkURL")
    text = request.form.get("linkText")
    component = request.form.get("linkComponent")

    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()

    dbCursor.execute(f"""
            INSERT INTO `nav_links`
            (`link`, `text`, `for_component`)
            VALUES
            ("{url}", "{text}", "{component}")
        """)
    
    dbConnection.commit()
    dbConnection.close()

    return redirect("/FSNavigation")


@app.route("/FSDeleteNavLink", methods=["POST", "GET"])
def FSDeleteNavLink():
    currID = request.args.get("id")

    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()

    dbCursor.execute(f"""
            DELETE FROM `nav_links` WHERE `id` = {currID}
        """)
    
    dbConnection.commit()
    dbConnection.close()

    return redirect("/FSNavigation")


@app.route("/FSArticles")
def FSArticles():
    articles = []

    if "userID" not in session or session["userRole"] != "admin":
        return redirect("/")

    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()

    dbCursor.execute(f"""
            SELECT * FROM `articles`
        """)
    fetch = dbCursor.fetchall()



    for record in fetch:
        article = []
        article.append(record[0])
        article.append(record[1])

        if record[6] != 0:
            dbCursor.execute(f"""
                SELECT name FROM `galleries` WHERE `id` = {record[6]}
            """)
            gallery = dbCursor.fetchone()[0]
            article.append(f"{record[6]} - {gallery}")
        else:
            article.append(f"{record[6]} - *BRAK*")

        if record[7] != 0:
            dbCursor.execute(f"""
                SELECT name FROM `categories` WHERE `id` = {record[7]}
            """)

            category = dbCursor.fetchone()[0]
            article.append(f"{record[7]} - {category}")
        else:
            article.append(f"{record[7]} - *BRAK*")

        articles.append(article)

    return render_template("FSArticles.html", title="Articles", articles=articles)


@app.route("/FSAddArticle")
def FSAddArticle():
    if "userID" not in session or session["userRole"] != "admin":
        return redirect("/")

    form = articleForm()
    form.id.data = 0

    return render_template("FSEditArticle.html", form=form, title="New article")


@app.route("/FSEditArticle")
def FSEditArticle():
    if "userID" not in session or session["userRole"] != "admin":
        return redirect("/")

    currID = request.args.get("id")

    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()

    dbCursor.execute(f"""
            SELECT * FROM `articles` WHERE `id` = {currID}
        """)
    article = dbCursor.fetchone()

    form = articleForm()
    form.title.data = article[1]
    form.subtitle.data = article[2]
    form.content.data = article[3].replace("&nbsp;&nbsp;&nbsp;", "/tab/ ").replace("</br>", "/nl/ ")
    form.connectedGallery.data = str(article[6])
    form.category.data = str(article[7])
    form.id.data = article[0]

    return render_template("FSEditArticle.html", form=form, title="Edit article")


@app.route("/FSSaveArticle", methods=["POST", "GET"])
def FSSaveArticle():
    currID = int(request.form.get("id"))
    title = request.form.get("title")
    subtitle = request.form.get("subtitle")
    content = request.form.get("content").replace("/tab/", "&nbsp;&nbsp;&nbsp;").replace("/nl/", "</br>")
    connectedGallery = request.form.get("connectedGallery")
    category = int(request.form.get("category"))

    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()

    if currID == 0:
        dbCursor.execute(f"""
            INSERT INTO articles
            (`title`, `subtitle`, `content`, `connected_gallery_id`, `category_id`, `creation_date`)
            VALUES
            ("{title}", "{subtitle}", "{content}", "{connectedGallery}", "{category}", datetime("now"))
        """)
    else:
        dbCursor.execute(f"""
            UPDATE articles
            SET `title` = "{title}", `subtitle` = "{subtitle}", `content` = "{content}", `connected_gallery_id` = "{connectedGallery}", `category_id` = "{category}"
            WHERE `id` = {currID}
        """)

    dbConnection.commit()
    dbConnection.close()

    return redirect("/FSArticles")


@app.route("/FSDeleteArticle", methods=["POST","GET"])
def FSDeleteArticle():
    currID = request.args.get("id")

    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()

    dbCursor.execute(f"""
            DELETE FROM articles WHERE `id` = {currID}
        """)

    dbConnection.commit()
    dbConnection.close()

    return redirect("/FSArticles")


@app.route("/FSUsers")
def FSUsers():
    if "userID" not in session or session["userRole"] != "admin":
        return redirect("/")

    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()

    dbCursor.execute(f"""
            SELECT * FROM `users`
        """)

    fetch = dbCursor.fetchall()

    dbConnection.close()

    return render_template("FSUsers.html", title="Users", users=fetch)


@app.route("/FSAddUser")
def FSAddUser():
    if "userID" not in session or session["userRole"] != "admin":
        return redirect("/")

    form = userForm()
    form.id.data = 0

    return render_template("FSEditUser.html", form=form, title="New user")


@app.route("/FSEditUser")
def FSEditUser():
    if "userID" not in session or session["userRole"] != "admin":
        return redirect("/")

    currID = request.args.get("id")

    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()

    dbCursor.execute(f"""
            SELECT * FROM `users` WHERE `id` = {currID}
        """)

    user = dbCursor.fetchone()

    form = userEditForm()
    form.login.data = user[1]
    form.email.data = user[3]
    form.role.data = user[4]
    form.id.data = user[0]

    return render_template("FSEditUser.html", form=form, title="Edit user")


@app.route("/FSSaveUser", methods=["POST", "GET"])
def FSSaveUser():
    currID = int(request.form.get("id"))
    login = request.form.get("login")
    password = request.form.get("password")
    confPassword = request.form.get("confPassword")
    email = request.form.get("email")
    role = request.form.get("role")

    if(confPassword != password):
        flash("Podane hasła nie są takie same")
        return redirect(f"/FSEditUser?id={currID}")
    dbConnection = sqlite3.connect('db.sqlite')
    dbCursor = dbConnection.cursor()

    dbCursor.execute(f"""
            SELECT * from users WHERE `email` = "{email}" OR `username` = "{login}"
        """)

    fetch = dbCursor.fetchall()

    if len(fetch) > 1 or fetch[0][0] != currID:
        flash("Podana nazwa użytkownika lub email są już zajęte")
        return redirect(f"/FSEditUser?id={currID}")

    if currID == 0:
        dbCursor.execute(f"""
            INSERT INTO users
            (`username`, `email`, `password`, `role`)
            VALUES
            ("{login}", "{email}", "{password}", "{role}")
        """)
    else:
        dbCursor.execute(f"""
            UPDATE users
            SET `username` = "{login}", `email` = "{email}", `role` = "{role}"
            WHERE `id` = {currID}
        """)

        if password != "":
            dbCursor.execute(f"""
            UPDATE users
            SET `password` = "{password}"
            WHERE `id` = {currID}
        """)

    dbConnection.commit()
    dbConnection.close()

    return redirect("/FSUsers")



@app.route("/uploads/<path:path>")
def uploads(path):
    return send_from_directory('../frontend/uploads', path)

# Path for all the static files (compiled JS/CSS, etc.)
@app.route("/<path:path>")
def home(path):
    return send_from_directory('../frontend/svelte/public', path)



if __name__ == '__main__':
    app.run(debug=True)

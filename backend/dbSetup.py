#potrzebne bazy danych:
# users (role: admin, redactor, user)
# sliders (id, nazwa)
# slides (id, id_slidera, url, tytuł, podtytuł, przycisk?, tekst_przycisku, url_przycisku)
# articles (id, ??id_listy, tytuł, podtytuł, tekst, url_obrazka, data)
# ??articles_lists (id, tytuł)
# comments (id, id_artykułu, id_użytkownika, data_dodania)
# featurettes: (id, tytuł, podtytuł, tekst, url_obrazka)
# nav_links: (id, link, tekst, dla (headera/stopki))
# globals (id, nazwa, wartość)
# zmienne globalne: domyślny szablon, liczba artykułów na stronie głównej, 


import sqlite3

# połączenie z bazą danych i utworzenie kursora

dbConnection = sqlite3.connect("backend/db.sqlite")
dbCursor = dbConnection.cursor()

# usunięcie tabeli
dbCursor.execute("""
    DROP TABLE IF EXISTS globals;
""")


dbCursor.execute("""
    DROP TABLE IF EXISTS users;
""")

dbCursor.execute("""
    DROP TABLE IF EXISTS sliders;
""")

dbCursor.execute("""
    DROP TABLE IF EXISTS slides;
""")

dbCursor.execute("""
    DROP TABLE IF EXISTS articles;
""")

dbCursor.execute("""
    DROP TABLE IF EXISTS featurettes;
""")

dbCursor.execute("""
    DROP TABLE IF EXISTS comments;
""")

dbCursor.execute("""
    DROP TABLE IF EXISTS nav_links;
""")


dbConnection.commit()


# utwozenie tabeli

# globals

dbCursor.execute("""
    CREATE TABLE IF NOT EXISTS globals(
        `id` integer PRIMARY KEY AUTOINCREMENT,
        `name` text,
        `value` text
    )
""")


# users

dbCursor.execute("""
    CREATE TABLE IF NOT EXISTS users(
        `id` integer PRIMARY KEY AUTOINCREMENT,
        `username` text,
        `password` text,
        `email` text,
        `role` text
    )
""")


# sliders (id, nazwa)

dbCursor.execute("""
    CREATE TABLE IF NOT EXISTS sliders(
        `id` integer PRIMARY KEY AUTOINCREMENT,
        `name` text
    )
""")


# slides (id, id_slidera, kolejność, ?url, tytuł, podtytuł, przycisk?, tekst_przycisku, url_przycisku)

dbCursor.execute("""
    CREATE TABLE IF NOT EXISTS slides(
        `id` integer PRIMARY KEY AUTOINCREMENT,
        `slider_id` integer,
        `img_url` text,
        `order` integer,
        `title` text,
        `subtitle` text,
        `show_button` boolean,
        `button_text` text,
        `button_url` text
    )
""")


# articles (id, ??id_listy, tytuł, podtytuł, tekst, url_obrazka, data)

dbCursor.execute("""
    CREATE TABLE IF NOT EXISTS articles(
        `id` integer PRIMARY KEY AUTOINCREMENT,
        `title` text,
        `subtitle` text,
        `content` text,
        `image_url` text,
        `creation_date` datetime
    )
""")


# featurettes: (id, tytuł, tekst, url_obrazka)

dbCursor.execute("""
    CREATE TABLE IF NOT EXISTS featurettes(
        `id` integer PRIMARY KEY AUTOINCREMENT,
        `title` text,
        `subtitle` text,
        `content` text,
        `image_url` text
    )
""")


# comments (id, id_artykułu, id_użytkownika, data_dodania, tekst)

dbCursor.execute("""
    CREATE TABLE IF NOT EXISTS comments(
        `id` integer PRIMARY KEY AUTOINCREMENT,
        `article_id` int,
        `user_id` int,
        `creation_date` datetime,
        `content` text
    )
""")


# nav_links: (id, link, tekst, dla (headera/stopki))

dbCursor.execute("""
    CREATE TABLE IF NOT EXISTS comments(
        `id` integer PRIMARY KEY AUTOINCREMENT,
        `link` text,
        `text` text,
        `for_component` text
    )
""")



dbConnection.commit()


# dane fabryczne

dbCursor.execute(f"""
    INSERT INTO globals
    (`name`, `value`)
    VALUES
    ("default_template", "1")
""")

dbCursor.execute(f"""
    INSERT INTO users 
    (`username`, `password`, `email`, `role`) 
    VALUES
    ("admin", "admin123", "admin@example.pl", "admin"),
    ("user", "user123", "user@example.pl", "user")
""")


dbCursor.execute(f"""
    INSERT INTO articles 
    (`title`, `subtitle`, `content`, `image_url`, `creation_date`) 
    VALUES
    ("tytuł", "podtytuł", "treść", "", datetime("now"))
""")


dbCursor.execute(f"""
    INSERT INTO sliders 
    (`name`) 
    VALUES
    ("slajder1")
""")


dbCursor.execute(f"""
    INSERT INTO slides 
    (`slider_id`, `order`, `img_url`, `title`, `subtitle`, `show_button`, `button_text`, `button_url`) 
    VALUES
    (1, 1, "gray1.jpg", "First slide label", "Some representative placeholder content for the first slide.", 0, "", ""),
    (1, 2, "gray2.jpg", "Second slide label", "Some representative placeholder content for the second slide.", 0, "", ""),
    (1, 3, "gray3.jpg", "Third slide label", "Some representative placeholder content for the third slide.", 0, "", "")
""")


dbCursor.execute(f"""
    INSERT INTO featurettes 
    (`title`, `subtitle`, `content`, `image_url`) 
    VALUES
    ("First featurette heading.", "It'll blow your mind.", "Donec ullamcorper nulla non metus auctor fringilla. Vestibulum id ligula porta felis euismod semper. Praesent commodo cursus magna, vel scelerisque nisl consectetur. Fusce dapibus, tellus ac cursus commodo.", "500.png")
""")


dbCursor.execute(f"""
    INSERT INTO comments 
    (`article_id`, `user_id`, `creation_date`, `content`) 
    VALUES
    (1, 1, datetime("now"), "tekst komentarza")
""")

dbCursor.execute(f"""
    INSERT INTO nav_links 
    (`link`, `text`, `for_component`) 
    VALUES
    ("index.html", "Home", "header")
""")




dbConnection.commit()

# zakończenie działania
dbCursor.close()
dbConnection.close()
#potrzebne bazy danych:
# users
# sliders (id, nazwa)
# slides (id, id_slidera, url, tytuł, podtytuł, przycisk?, tekst_przycisku, url_przycisku)
# articles (id, ??id_listy, tytuł, podtytuł, tekst, url_obrazka, data)
# ??articles_lists (id, tytuł)
# comments (id, id_artykułu, id_użytkownika, data_dodania)
# featurettes: (id, tytuł, tekst, url_obrazka)
# globals (id, nazwa, wartość)
# zmienne globalne: domyślny szablon, liczba artykułów na stronie głównej, 


import sqlite3

# połączenie z bazą danych i utworzenie kursora

dbConnection = sqlite3.connect('CMSProject/backend/db.sqlite')
dbCursor = dbConnection.cursor()

# usunięcie tabeli

dbCursor.execute("""
    DROP TABLE IF EXISTS users;
""")

dbCursor.execute("""
    DROP TABLE IF EXISTS sliders;
""")

dbCursor.execute("""
    DROP TABLE IF EXISTS slides;
""")

dbConnection.commit()


# utwozenie tabeli

dbCursor.execute("""
    CREATE TABLE IF NOT EXISTS users(
        `id` integer PRIMARY KEY AUTOINCREMENT,
        `username` text,
        `password` text,
        `email` text,
        `role` text
    )
""")
dbConnection.commit()


# sliders (id, nazwa)

dbCursor.execute("""
    CREATE TABLE IF NOT EXISTS sliders(
        `id` integer PRIMARY KEY AUTOINCREMENT,
        `name` text
    )
""")
dbConnection.commit()


# slides (id, id_slidera, kolejność, ?url, tytuł, podtytuł, przycisk?, tekst_przycisku, url_przycisku)

dbCursor.execute("""
    CREATE TABLE IF NOT EXISTS slides(
        `id` integer PRIMARY KEY AUTOINCREMENT,
        `slider_id` integer,
        `order` integer,
        `title` text,
        `subtitle` text,
        `show_button` boolean,
        `button_text` text,
        `button_url` text
    )
""")
dbConnection.commit()


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
dbConnection.commit()


# # przykładowe dane

dbCursor.execute(f"""
    INSERT INTO articles 
    (`title`, `subtitle`, `content`, `image_url`, `creation_date`) 
    VALUES
    ('tytuł', 'podtytuł', 'treść', '', datetime('now'))
""")
dbConnection.commit()


# zakończenie działania
dbCursor.close()
dbConnection.close()
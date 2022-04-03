#potrzebne bazy danych:
# users
# sliders (id, nazwa)
# slides (id, id_slidera, url, tytuł, podtytuł, przycisk?, tekst_przycisku, url_przycisku)
# articles (id, tytuł, podtytuł, tekst, url_obrazka
# comments (id, id_artykułu, id_użytkownika)
# featurettes: (id, tytuł, tekst, url_obrazka)
# globals (id, nazwa, wartość)
# zmienne globalne: domyślny szablon, liczba artykułów na stronie głównej, 


import sqlite3

# połączenie z bazą danych i utworzenie kursora

dbConnection = sqlite3.connect('CMSProject/backend/db.sqlite')
dbCursor = dbConnection.cursor()

# usunięcie tabeli

dbCursor.execute("""
    DROP TABLE IF EXISTS users
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


# # przykładowe dane

# dbCursor.execute(f"""
#     INSERT INTO users 
#     (`username`, `password`, `email`, `role`) 
#     VALUES
#     ('user2', 'password5', 'user@user.pl', 'redactor')
# """)

# dbConnection.commit()


# zakończenie działania
dbCursor.close()
dbConnection.close()
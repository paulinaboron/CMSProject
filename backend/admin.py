from tkinter import *
import sqlite3

root = Tk()
root.title("Logowanie")
root.geometry("600x300")


def log_in():
    connection = sqlite3.connect('db.sqlite')
    cursor = connection.cursor()

    cursor.execute(f"SELECT password, role from users where username = '{login_entry.get()}'")
    records = cursor.fetchall()
    print(records)

    if not records:
        print("zle dane")
        txt = Label(root, text='Nie ma takiego użytkownika')
        txt.grid(row=3, column=1)
    else:
        passw = records[0][0]
        role = records[0][1]

        if passw == pass_entry.get() and role == 'admin':
            menu_window()
        else:
            txt = Label(root, text='Niepoprawne dane')
            txt.grid(row=3, column=1)


def menu_window():
    root.destroy()

    window = Tk()
    window.title('CMS')
    window.geometry("1000x600")

    Button(window, text="Strona główna", command=lambda: click(main_page), width=30).grid(row=10, column=0)

    main_page = Frame(window)
    users_page = Frame(window)
    menu_page = Frame(window)
    news_page = Frame(window)
    slider_page = Frame(window)

    for frame in (main_page, users_page, menu_page, news_page, slider_page):
        frame.grid(row=0, column=0, sticky='news')

    click(main_page)

    """Users Page"""
    Label(users_page, text="Użytkownicy", font=('Helvetica', 14), pady=20, padx=50).grid(row=0, column=0,
                                                                                         sticky='e')
    users_data = select_from_db("Select * from users")

    tab = ["lp.", 'Login', "Hasło", "email", "rola"]
    for i in range(len(tab)):
        lab = Label(users_page, text=tab[i])
        lab.grid(row=1, column=i, sticky=NSEW)

    for i in range(len(users_data)):
        for j in range(len(users_data[0])):
            e = Entry(users_page, relief=GROOVE)
            e.grid(row=i + 2, column=j, sticky=NSEW)
            e.insert(END, (users_data[i][j]))

    for i in range(len(users_data)):
        if users_data[i][1] != "admin":
            Button(users_page, text="Edit", command=lambda temp=i: edit_users(temp, window), padx=15).grid(row=i + 2,
                                                                                                           column=10)

    """Main Page"""
    Label(main_page, text="Zarządzanie zawartością strony", font=('Helvetica', 14), pady=50).grid(row=0,
                                                                                                  column=0)
    Button(main_page, text="Użytkownicy", command=lambda: click(users_page), pady=10, width=50).grid(row=1,
                                                                                                     column=0)
    Button(main_page, text="Menu", command=lambda: click(menu_page), pady=10, width=50).grid(row=2, column=0)
    Button(main_page, text="Artykuły", command=lambda: click(news_page), pady=10, width=50).grid(row=3,
                                                                                                 column=0)
    Button(main_page, text="Slider", command=lambda: click(slider_page), pady=10, width=50).grid(row=5,
                                                                                                 column=0)

    """Slider Page"""
    Label(slider_page, text="Slider", font=('Helvetica', 14), pady=20, padx=50).grid(row=0, column=0,
                                                                                     sticky='e')
    slides_data = select_from_db("Select * from slides")

    for i in range(len(slides_data)):
        e1 = Entry(slider_page, relief=GROOVE)
        e1.grid(row=i + 2, column=0, sticky=NSEW)
        e1.insert(END, (slides_data[i][0]))

        e2 = Entry(slider_page, relief=GROOVE)
        e2.grid(row=i + 2, column=1, sticky=NSEW)
        e2.insert(END, (slides_data[i][4]))

        e3 = Entry(slider_page, relief=GROOVE, width=70)
        e3.grid(row=i + 2, column=2, sticky=NSEW)
        e3.insert(END, (slides_data[i][5]))

        Button(slider_page, text="Edit", command=lambda temp=i: edit_slider(temp, window), padx=15).grid(
            row=i + 2,
            column=10)

    """Menu Page"""
    Label(menu_page, text="Menu", font=('Helvetica', 14), pady=20, padx=50).grid(row=0, column=0,
                                                                                 sticky='e')
    menu_data = select_from_db("Select * from nav_links")

    for i in range(len(menu_data)):
        e1 = Entry(menu_page, relief=GROOVE)
        e1.grid(row=i + 2, column=0, sticky=NSEW)
        e1.insert(END, (menu_data[i][0]))

        e2 = Entry(menu_page, relief=GROOVE)
        e2.grid(row=i + 2, column=1, sticky=NSEW)
        e2.insert(END, (menu_data[i][2]))

        Button(menu_page, text="Edit", command=lambda temp=i: edit_menu(temp, window), padx=15).grid(
            row=i + 2,
            column=10)

    Button(menu_page, text="Dodaj", command=lambda: add_link(window)).grid(row=1, column=12)

    """News Page"""
    Label(news_page, text="Artykuły", font=('Helvetica', 14), pady=20, padx=50).grid(row=0, column=0,
                                                                                     sticky='e')
    news_data = select_from_db("Select * from articles")

    for i in range(len(news_data)):
        e1 = Entry(news_page, relief=GROOVE)
        e1.grid(row=i + 2, column=0, sticky=NSEW)
        e1.insert(END, (news_data[i][0]))

        e2 = Entry(news_page, relief=GROOVE)
        e2.grid(row=i + 2, column=1, sticky=NSEW)
        e2.insert(END, (news_data[i][1]))

        Button(news_page, text="Edit", command=lambda temp=i: edit_news(temp, window), padx=15).grid(
            row=i + 2,
            column=10)


def click(frame):
    frame.tkraise()


def add_link(w):
    add_window = Toplevel(w)
    add_window.title("Dodawanie linku")
    add_window.geometry("600x400")

    label = Label(add_window, text="Dodawanie linku")
    label.grid(row=0, column=1)

    tab = ["Link", "Tekst", "Komponent", "Kolejność"]

    e1 = Entry(add_window, width=70)
    e1.grid(row=1, column=1, sticky=NSEW)

    e2 = Entry(add_window, width=70)
    e2.grid(row=2, column=1, sticky=NSEW)

    e3 = Entry(add_window, width=70)
    e3.grid(row=3, column=1, sticky=NSEW)

    e4 = Entry(add_window, width=70)
    e4.grid(row=4, column=1, sticky=NSEW)

    for i in range(len(tab)):
        Label(add_window, text=tab[i]).grid(row=i + 1, column=0)

    btn = Button(add_window, text="Zapisz",
                 command=lambda: save_link([e1.get(), e2.get(), e3.get(), e4.get(), add_window]))
    btn.grid(row=5, column=1)


def select_from_db(query):
    connection = sqlite3.connect('db.sqlite')
    cursor = connection.cursor()

    cursor.execute(query)
    records = cursor.fetchall()
    print(records)
    return records


def edit_users(_id, w):
    print(11, _id)
    edit_window = Toplevel(w)
    edit_window.title("Edytowanie")
    edit_window.geometry("600x400")

    Label(edit_window, text="Edycja danych użytkownika").grid(row=0, column=1)
    records = select_from_db(f"Select * from users where id = '{_id + 1}'")
    data = records[0]

    tab = ["Login", "Hasło", "Rola"]

    e1 = Entry(edit_window)
    e1.insert(END, (data[1]))
    e1.grid(row=1, column=1, sticky=NSEW)

    e2 = Entry(edit_window)
    e2.insert(END, (data[2]))
    e2.grid(row=2, column=1, sticky=NSEW)

    e3 = Entry(edit_window)
    e3.insert(END, (data[4]))
    e3.grid(row=3, column=1, sticky=NSEW)

    for i in range(len(tab)):
        Label(edit_window, text=tab[i]).grid(row=i + 1, column=0)

    Button(edit_window, text="Zapisz zmiany",
           command=lambda: save_users([_id + 1, e1.get(), e2.get(), e3.get(), edit_window])).grid(row=4, column=1)


def edit_slider(_id, w):
    edit_window = Toplevel(w)
    edit_window.title("Edytowanie slidera")
    edit_window.geometry("600x400")

    Label(edit_window, text="Edycja danych slidera").grid(row=0, column=1)
    records = select_from_db(f"Select * from slides where id = '{_id + 1}'")
    data = records[0]

    tab = ["Tytuł", "Opis"]

    e1 = Entry(edit_window, width=70)
    e1.insert(END, (data[4]))
    e1.grid(row=1, column=1, sticky=NSEW)

    e2 = Entry(edit_window, width=70)
    e2.insert(END, (data[5]))
    e2.grid(row=2, column=1, sticky=NSEW)

    for i in range(len(tab)):
        Label(edit_window, text=tab[i]).grid(row=i + 1, column=0)

    Button(edit_window, text="Zapisz zmiany",
           command=lambda: save_slider([_id + 1, e1.get(), e2.get(), edit_window])).grid(row=4, column=1)


def edit_menu(_id, w):
    edit_window = Toplevel(w)
    edit_window.title("Edytowanie menu")
    edit_window.geometry("600x400")

    Label(edit_window, text="Edycja danych menu").grid(row=0, column=1)
    records = select_from_db(f"Select * from nav_links where id = '{_id + 1}'")
    data = records[0]

    tab = ["Tekst", "Link", "Komponent"]

    e1 = Entry(edit_window, width=70)
    e1.insert(END, (data[2]))
    e1.grid(row=1, column=1, sticky=NSEW)

    e2 = Entry(edit_window, width=70)
    e2.insert(END, (data[1]))
    e2.grid(row=2, column=1, sticky=NSEW)

    e3 = Entry(edit_window, width=70)
    e3.insert(END, (data[3]))
    e3.grid(row=3, column=1, sticky=NSEW)

    for i in range(len(tab)):
        Label(edit_window, text=tab[i]).grid(row=i + 1, column=0)

    Button(edit_window, text="Zapisz zmiany",
           command=lambda: save_menu([_id + 1, e1.get(), e2.get(), e3.get(), edit_window])).grid(row=4, column=1)


def edit_news(_id, w):
    edit_window = Toplevel(w)
    edit_window.title("Edytowanie artukułów")
    edit_window.geometry("600x400")

    Label(edit_window, text="Edycja danych artykułów").grid(row=0, column=1)
    records = select_from_db(f"Select * from articles where id = '{_id + 1}'")
    data = records[0]

    tab = ["Tytuł", "Podtytuł", "Treść"]

    e1 = Entry(edit_window, width=70)
    e1.insert(END, (data[1]))
    e1.grid(row=1, column=1, sticky=NSEW)

    e2 = Entry(edit_window, width=70)
    e2.insert(END, (data[2]))
    e2.grid(row=2, column=1, sticky=NSEW)

    e3 = Entry(edit_window, width=70)
    e3.insert(END, (data[3]))
    e3.grid(row=3, column=1, sticky=NSEW)

    for i in range(len(tab)):
        Label(edit_window, text=tab[i]).grid(row=i + 1, column=0)

    Button(edit_window, text="Zapisz zmiany",
           command=lambda: save_news([_id + 1, e1.get(), e2.get(), e3.get(), edit_window])).grid(row=4, column=1)


def save_users(data):
    print(data)
    data[4].destroy()
    connection = sqlite3.connect('db.sqlite')
    cursor = connection.cursor()

    cursor.execute(
        f"UPDATE users SET username = '{data[1]}', password = '{data[2]}', role = '{data[3]}' WHERE id = {data[0]};")
    connection.commit()


def save_slider(data):
    data[3].destroy()
    connection = sqlite3.connect('db.sqlite')
    cursor = connection.cursor()

    cursor.execute(
        f"UPDATE slides SET title = '{data[1]}', subtitle = '{data[2]}' WHERE id = {data[0]};")
    connection.commit()


def save_menu(data):
    data[4].destroy()
    connection = sqlite3.connect('db.sqlite')
    cursor = connection.cursor()

    cursor.execute(
        f"UPDATE nav_links SET text = '{data[1]}', link = '{data[2]}', for_component = '{data[3]}' WHERE id = {data[0]};")
    connection.commit()


def save_link(data):
    data[4].destroy()
    connection = sqlite3.connect('db.sqlite')
    cursor = connection.cursor()

    cursor.execute(
        f"""INSERT INTO nav_links (`link`, `text`, `for_component`, `order`) VALUES ("{data[0]}", "{data[1]}", "{data[2]}", {data[3]}) """
    )
    connection.commit()


def save_news(data):
    data[4].destroy()
    connection = sqlite3.connect('db.sqlite')
    cursor = connection.cursor()

    cursor.execute(
        f"UPDATE articles SET title = '{data[1]}', subtitle = '{data[2]}', content = '{data[3]}' WHERE id = {data[0]};")
    connection.commit()


login_entry = Entry(root, width=30, font=('Helvetica', 14))
login_entry.grid(row=0, column=1, padx=10, pady=30)
login_label = Label(root, text="Login:", font=('Helvetica', 14))
login_label.grid(row=0, column=0, sticky=E, padx=30)

pass_entry = Entry(root, width=30, font=('Helvetica', 14))
pass_entry.grid(row=1, column=1, padx=10)
pass_label = Label(root, text="Password:", font=('Helvetica', 14))
pass_label.grid(row=1, column=0, sticky=E, padx=30)

button = Button(root, text="OK", command=log_in)
button.grid(row=2, column=1, pady=30)

root.mainloop()

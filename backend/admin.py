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
            users_window()
        else:
            txt = Label(root, text='Niepoprawne dane')
            txt.grid(row=3, column=1)


def menu_window():
    # root.destroy()

    window = Tk()
    window.title('CMS')
    window.geometry("1000x600")

    btn_back = Button(window, text="Strona główna", command=lambda: click(main_page), width=30).grid(row=10, column=0)

    main_page = Frame(window, bg='red')
    users_page = Frame(window)
    menu_page = Frame(window)
    news_page = Frame(window)
    footer_page = Frame(window)
    slider_page = Frame(window)

    l1 = Label(users_page, text="Użytkownicy", font=('Helvetica', 14)).grid(row=0, column=0)
    users_data = select_from_db("Select * from users")

    tab = ["lp.", 'Login', "Hasło", "email", "rola"]
    for i in range(len(tab)):
        lab = Label(users_page, text=tab[i])
        lab.grid(row=0, column=i, sticky=NSEW)
    for i in range(len(users_data)):
        for j in range(len(users_data[0])):
            e = Entry(users_page, relief=GROOVE)
            e.grid(row=i+1, column=j, sticky=NSEW)
            e.insert(END, (users_data[i][j]))

    l2 = Label(menu_page, text="mmmm").grid(row=1, column=0)
    l3 = Label(news_page, text="nwewe").grid(row=1, column=0)

    for frame in (main_page, users_page, menu_page, news_page, footer_page, slider_page):
        frame.grid(row=0, column=0, sticky='news')

    label = Label(main_page, text="Zarządzanie zawartością strony", font=('Helvetica', 14), pady=50).grid(row=0,
                                                                                                          column=0)
    btn_users = Button(main_page, text="Użytkownicy", command=lambda: click(users_page), pady=10, width=50).grid(row=1,
                                                                                                                 column=0)
    btn_menu = Button(main_page, text="Menu", command=lambda: click(menu_page), pady=10, width=50).grid(row=2, column=0)
    btn_news = Button(main_page, text="Artykuły", command=lambda: click(news_page), pady=10, width=50).grid(row=3,
                                                                                                            column=0)
    btn_footer = Button(main_page, text="Stopka", command=lambda: click(footer_page), pady=10, width=50).grid(row=4,
                                                                                                              column=0)
    btn_slider = Button(main_page, text="Slider", command=lambda: click(slider_page), pady=10, width=50).grid(row=5,
                                                                                                              column=0)

    click(main_page)


def users_window():
    root.destroy()

    window = Tk()
    window.title('CMS')
    window.geometry("1000x600")

    title = Label(window, text="Użytkownicy", font=('Helvetica', 14), pady=20, padx=50).grid(row=0, column=0, sticky='e')
    users_data = select_from_db("Select * from users")

    tab = ["lp.", 'Login', "Hasło", "email", "rola"]
    for i in range(len(tab)):
        lab = Label(window, text=tab[i])
        lab.grid(row=1, column=i, sticky=NSEW)

    for i in range(len(users_data)):
        for j in range(len(users_data[0])):
            e = Entry(window, relief=GROOVE)
            e.grid(row=i+2, column=j, sticky=NSEW)
            e.insert(END, (users_data[i][j]))

    for i in range(len(users_data)):
        b = Button(window, text="Edit", command=lambda temp=i: edit(temp, window), padx=15).grid(row=i+2, column=10)
        print(i, "iiii")


def click(frame):
    frame.tkraise()


def select_from_db(query):
    connection = sqlite3.connect('db.sqlite')
    cursor = connection.cursor()

    cursor.execute(query)
    records = cursor.fetchall()
    print(records)
    return records


def edit(_id, w):
    print(11, _id)
    edit_window = Toplevel(w)
    edit_window.title("Edytowanie")
    edit_window.geometry("600x400")

    label = Label(edit_window, text="Edycja danych użytkownika").grid(row=0, column=1)
    records = select_from_db(f"Select * from users where id = '{_id+1}'")
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
        l = Label(edit_window, text=tab[i]).grid(row=i+1, column=0)

    btn = Button(edit_window, text="Zapisz zmiany", command=lambda: save([_id+1, e1.get(), e2.get(), e3.get()])).grid(row=4, column=1)


def save(data):
    print(data)
    connection = sqlite3.connect('db.sqlite')
    cursor = connection.cursor()

    cursor.execute(f"UPDATE users SET username = '{data[1]}', password = '{data[2]}', role = '{data[3]}' WHERE id = {data[0]};")
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

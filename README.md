# CMSProject

System CMS do zarządzania zawartością strony internetowej.

## Informacje ogólne

### Struktura plików

-   **backend**:

    -   **app.py** - serwer
    -   **db.sqlite** - baza danych
    -   **dbSetup.py** - plik ustawień fabrycznych bazy danych

        > Zmiany w tym pliku mogą spowodować problemy z działaniem systemu. <br> Zalecane jest, aby nie zmieniać jego zawartości.

-   **frontend**:

    -   **uploads** - lokalizacja obrazów uploadowanych przez system

        > Usunięcie obrazów z podfolderów może skutkować błędami na froncie. <br> Głównie dotyczyć one mogą nieładujących się obrazów.

    -   **svelte** - zawiera część frontową aplikacji oraz główną część CMSu
    -   **svelte/public** - zbundlowane pliki gotowe do produkcji
    -   **svelte/src** - pliki źródłowe części projektu wykonanej w Svelte

-   Pozostałe lokalizacje oraz pliki są w głównej mierze nieistotne dla działania systemu lub zostaną opisane później

### Pierwsze kroki

1.  Po pobraniu zaleca się uruchomić plik **dbSetup.py** w celu utworzenia w bazie danych potrzebnych tabel i przypisania danych fabrycznych

    > Wszystkie pliki Pythona (**.py**) najlepiej uruchamiać ze środowiska PyCharm, w którym nie występuje opisany dalej błąd. <br> Jeżeli jednak preferowanym środowiskiem jest VSCode, to przed uruchomieniem takiego pliku należy się upewnić, że otwarty jest **główny folder projektu**. <br> Uruchomienie takiego pliku z innej lokalizacji może powodować błąd, w którym interpreter usiłuje odczytać lub zapisać bazę danych w nieporządanej lokalizacji.

2.  W celu włączenia serwera konieczna jest konfiguracja interpretera Python oraz instalacja pakietów podanych w pliku **requirements.txt** z głównego folderu aplikacji.

    > Znowu, proces ten jest szybszy i bardziej intuicyjny w PyCharm. <br> Oczywiście istnieje opcja pracy w VSCode. <br> Dokładne instrukcje dot. tego zagadnienia znajdują się [TUTAJ](https://code.visualstudio.com/docs/python/tutorial-flask)

3.  Jeżeli przewidziana jest dalsza praca nad kodem źródłowym stworzonym w Svelte, należy zainstalować potrzebne moduły Node. <br> W tym celu, z głównego foldera projektu należy wykonać:

    ```bash
    > cd frontend/svelte
    > npm install
    ```

    > Krok ten jest opcjonalny. <br> Nie jest on wymagany do uruchomienia serwera i poprawnego działania którejkolwiek aplikacji.

### Uruchomienie aplikacji

Do poprawnego działania aplikacji należy uruchomić serwer: **backend/app.py**

-   Po jego uruchomieniu, cała strona powinna działać na porcie 5000, czyli [TUTAJ](http://127.0.0.1:5000)

    > Routing strony został zaimplementowany całkowicie po stronie serwera.
    > Oznacza to, że nie ma możliwości uruchomienia aplikacji za pomocą polecenia
    >
    > ```bash
    > npm run dev
    > ```
    >
    > Wszelkie zmiany w plikach źródłowych (folder **svelte/src**) muszą zostać zbundlowane poleceniem
    >
    > ```bash
    > PS ...\CMSProject\frontend\svelte
    > > npm run build
    > ```
    >
    > Oczywiście w tym celu należy wykonać krok 3. z sekcji **Pierwsze kroki**.

## Zawartość strony

Niezależnie od lokalizacji użytkownika na stronie, niektóre elementy się nie różnią.

-   Na górze znajduje się nawigacja. Domyślnie wyświetla ona linki do strony głównej, strony ze wszystkimi artykułami, artykułu oraz kategorii.

    -   Na końcu znajduje się wyszukiwarka, która znajduje podane frazy w tytułach, podtytułach oraz zawartościach artykułów.
    -   W prawej części umieszczony jest switch do zmiany motywu strony na ciemny
    -   Pasek nawigacyjny zawiera również link do strony logowania oraz rejestracji.
    -   Po zalogowaniu, użytkownik może zmienić swój email oraz hasło.
    -   Zalogowany _admin_ ma dostęp do **panelu administratora**

-   Na dole natomiast zawarta jest stopka z paroma linkami oraz tekstem.

### Strona główna

W zależności od wybranego układu na stronie głównej mogą występować trzy rodzaje elementów:

-   Slajdery: <br>
    Proste galerie paru zdjęć z podpisami,
-   Featuretty: <br>
    Pojedyncza ramka z zawartością tekstową i dużym zdjęciem,
-   Sekcje artykułów <br>
    Krótka lista najnowszych artykułów

Slajdery oraz featuretty mogą być definiowane oraz edytowane w panelu administratora i występować mogą wielokrotnie w różnych instancjach. <br>
Sekcja newsów z kolei nie może być zmieniona i zawsze wyświetla linki do maksymalnie trzech najnowszych artykułów (o ile zostało ich tyle napisane). Również może występować wielokrotnie na stronie głównej.

> Dane do logowania jako administrator:</br>Login: admin</br>Password: admin123</br>

## Grupa

Michał Kurbiel </br>
Paulina Boroń

# CMSProject

System CMS do zarządzania zawartością strony internetowej.

## Informacje ogólne

### Struktura plików

-   **backend**:

    -   **app.py** - serwer
    -   **admin.py** - aplikacja desktopowa TKInter
    -   **db.sqlite** - baza danych
    -   **dbSetup.py** - plik ustawień fabrycznych bazy danych

        > Zmiany w tym pliku mogą spowodować problemy z działaniem systemu. <br> Zalecane jest, aby nie zmieniać jego zawartości, poza sytuacjami opisanymi niżej.

-   **frontend**:

    -   **uploads** - lokalizacja obrazów uploadowanych przez system

        > Usunięcie obrazów z podfolderów może skutkować błędami na froncie. <br> Głównie dotyczyć one mogą nieładujących się obrazów.

    -   **svelte** - zawiera część frontową aplikacji oraz główną część CMSa
    -   **svelte/public** - zbundlowane pliki gotowe do produkcji
    -   **svelte/src** - pliki źródłowe części projektu wykonanej w Svelte

-   Pozostałe lokalizacje oraz pliki są w głównej mierze nieistotne dla działania systemu lub zostaną opisane później

### Pierwsze kroki

1.  Po pobraniu zaleca się zmienić hasło domyślnego **admina** w pliku **dbSetup.py**. <br> Chodzi dokładniej o zmianę wartości _admin123_ w linijce 289 tego pliku.

    > Jest to jedyny sposób na zmianę hasła konta **admin**. CMS nie przewiduje możliwości późniejszej jego zmiany. Zalecane jest zatem utworzenie nowego konta i przypisanie do niego roli administratora, a pozostawienie domyślnego jako zapasowe.

    Następnie należy uruchomić plik **dbSetup.py** w celu utworzenia w bazie danych potrzebnych tabel i przypisania danych fabrycznych

    > Wszystkie pliki Pythona (**.py**) najlepiej uruchamiać ze środowiska PyCharm, w którym nie występuje opisany dalej błąd.
    > Jeżeli jednak preferowanym środowiskiem jest VSCode, to przed uruchomieniem takiego pliku należy się upewnić, że otwarty jest **główny folder projektu**. <br>
    >
    > ```ps
    > (.venv) PS ...\CMSProject\>
    > > python3 "./backend/dbSetup.py"
    > ```
    >
    > ```ps
    > (.venv) PS ...\CMSProject\>
    > > python3 "./backend/admin.py"
    > ```
    >
    > Uruchomienie takiego pliku z innej lokalizacji może powodować błąd, w którym program usiłuje odczytać lub zapisać bazę danych w nieporządanej lokalizacji.

2.  W celu włączenia serwera konieczna jest konfiguracja wirtualnego środowiska Python oraz instalacja w nim pakietów podanych w pliku **requirements.txt** z głównego folderu aplikacji.

    > Znowu, proces ten jest szybszy i bardziej intuicyjny w PyCharm. <br> Oczywiście istnieje opcja pracy w VSCode. <br> Dokładne instrukcje dot. tego zagadnienia znajdują się [TUTAJ](https://code.visualstudio.com/docs/python/tutorial-flask) <br> Z kolei wszystkie potrzebna EnvVary można ustawić poleceniem z pliku **flask.txt** z folderu **backend**.

3.  Jeżeli przewidziana jest dalsza praca nad kodem źródłowym stworzonym w Svelte, należy zainstalować potrzebne moduły Node. <br> W tym celu, z głównego foldera projektu należy wykonać:

    ```bash
    > cd frontend/svelte
    > npm install
    ```

    > Krok ten jest opcjonalny. <br> Nie jest on wymagany do uruchomienia serwera i poprawnego działania którejkolwiek części aplikacji.

### Uruchomienie aplikacji

Do poprawnego działania aplikacji należy uruchomić serwer: **backend/app.py**

-   Po jego uruchomieniu, cała strona powinna działać na porcie 5000, czyli [TUTAJ](http://127.0.0.1:5000)

    > Routing strony został zaimplementowany całkowicie po stronie serwera.
    > Oznacza to, że nie ma możliwości uruchomienia aplikacji za pomocą polecenia
    >
    > ```ps
    > npm run dev
    > ```
    >
    > Wszelkie zmiany w plikach źródłowych (folder **svelte/src**) muszą zostać zbundlowane poleceniem
    >
    > ```ps
    > PS ...\CMSProject\frontend\svelte
    > > npm run build
    > ```
    >
    > W tym celu należy wcześniej wykonać krok 3. z sekcji **Pierwsze kroki**.

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

> Dane do logowania jako administrator: <br> Login: admin<br>Hasło: admin123 <br> (chyba że zostało wcześniej zmienione)<br>

### Strona artykułu

Większość elementów artykułu powtarza się na każdej podstronie tego typu. <br> Są to:

-   Tytuł - na samej górze
-   Podtytuł - pod tytułem
-   Treść
-   Sekcja komentarzy - pod treścią
    -   Komentarze mogą pisać tylko zalogowani użytkownicy.
    -   Próba napisania komentarza bez zalogowania odsyła do strony logowania.

Jedynym opcjonalnym elementem strony artykułu jest galeria. <br> Może, choć nie musi, być przypisana do artykułu. Ta sama może również występować w wielu artykułach jednocześnie. Jednak do jednego artykułu nie może być przypisanych więcej niż jedna.

### Strona kategorii

Jej jedynymi elementami jest wytłuszczona nazwa oraz lista artykułów występujących w danej kategorii. Nie ma limitu co do ich liczby. <br> Strona ta wyświetla się bez listy, jeżeli do danej kategorii nie dodano żadnego artykułu.

### Strona artykułów

Wyświetla listę wszystkich dodanych artykułów. Podobnie jak wyżej, nie ma ograniczeń co do ich liczby.

## CMS

Po zalogowaniu przez _administratoraa_, w pasku nawigacyjnym pojawia się odnośnik **_Admin_**, kierujący do podstrony _/admin_ - głównej części CMSa. <br> Podzielona jest ona na 7 części:

-   Featurette'y'
-   Slidery
-   Galerie

    > Przypisywanie i edycja slajdów/fotografii do nowych slajderów i galerii możliwa jest po ich zapisaniu.

    > Powyższe części są podzielone na dwie sekcje - główną oraz podstronę uploadu, w której można wgrywać pliki obrazów do poszczególnych bloków. <br> Uploadowane obrazy znajdują się w podfolderach folderu **_frontend/uploads_**. <br> Po uploadzie nie jest konieczne odświeżenie strony - nowe obrazy natychmiastowo pojawiają się w rozwijanych listach.

-   Artykuły
    > W **treści** artykułów, poza zwykłym tekstem, można zawrzeć również wcięcie oraz przejście do nowej linii. <br> Można to osiągnąć za pomocą specjalnych znaczników. <br> Są to kolejno: **_<tab\>_** oraz **_<nl\>_**.
-   Kategorie
-   Linki
    > W nawigacji oraz stopce linki prowadzić mogą do podstron opisanych we wcześniejszym rozdziale.
-   Templates - strona edycji układu. <br> Jej funkcją jest tworzenie układów i edycja już istniejąych, poprzez zmianę ogólnych ustawień:

    -   nazwy,
    -   głównych kolorów,
    -   tekstu stopki,
    -   stylu nawigacji,
    -   fontu,

    a także definiowanie i zamiana miejscami sekcji na stronie głównej.

Z wysokości CMSa, poprzez nawigację, jest możliwość powrotu do strony głównej oraz przejści do strony "Fast settings". <br> Jest to część CMSa stworzona we Flasku, dzięki której zalogowany _administrator_ ma możliwość:

-   Zarządzania użytkownikami
-   Zmiany wyświetlanego układu strony głównej
-   Eksportu ustawień wyświetlanego układu do pliku **.json**
-   Wczytanie tych ustawień do obecnie wybranego układu.
-   Zarządzania nawigacją i stopką
-   Tworzenia i edycji artykułów
    > Znaczniki wcięcia i nowej linii różnią się od tych w "dużym CMSie". <br> Tutaj są to kolejno **_/tab/_** oraz **_/nl/_**.

## Grupa

Michał Kurbiel </br>
Paulina Boroń

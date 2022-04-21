<script>
    async function getLinks() {
        let response = await fetch(
            `/getLinks?component=header`,
            { method: "post" }
        );
        let responseJson = await response.json();
        console.log("response nav: ", responseJson);
        return responseJson;
    }

    async function getLoggedUser() {
        let response = await fetch(
            `/getLoggedUserData`,
            { method: "post" }
        );
        let responseJson = await response.json();
        console.log("response logUser: ", responseJson);
        return responseJson;
    }

    let loggedUserData = getLoggedUser();
    let navData = getLinks();

    $: navData = getLinks();
    $: loggedUserData = getLoggedUser();

    let windowWidth = window.innerWidth;

    window.addEventListener("resize", function () {
        windowWidth = window.innerWidth;
    });
</script>

{#await navData}
    <h1>Oczekiwanie na dane nawigacji</h1>
{:then navData}
    {#if windowWidth > 990}
        <nav class="navbar navbar-expand-lg">
            <div class="container-fluid">
                <div class="collapse navbar-collapse" id="navbarScroll">
                    <ul
                        class="navbar-nav me-auto my-2 my-lg-0 navbar-nav-scroll"
                        style="--bs-scroll-height: 100px"
                    >
                        {#each navData as item}
                            <li class="nav-item">
                                <a class="nav-link" href={item.url}
                                    >{item.text}</a
                                >
                            </li>
                        {/each}
                    </ul>

                    {#await loggedUserData}
                        <h1>Oczekiwanie na dane użytkownika</h1>
                    {:then loggedUserData}
                        {#if loggedUserData.error_message}
                            <form class="d-flex">
                                <a
                                    href="/register"
                                    class="btn btn-sm btn-outline-primary"
                                    >Register</a
                                >
                                <a
                                    href="/login"
                                    class="btn btn-sm btn-outline-success"
                                    id="login-btn"
                                >
                                    Login
                                </a>
                            </form>
                        {:else}
                            <span class="px-3">
                                Zalogowany jako: <strong
                                    >{loggedUserData.userName}</strong
                                >
                            </span>

                            <a href="/logoutUser">Wyloguj</a>
                        {/if}
                    {/await}
                </div>
            </div>
        </nav>
    {:else}
        <!--Navbar-->
        <nav class="navbar navbar-light light-blue lighten-4">
            <!-- Navbar brand -->
            <a class="navbar-brand" href="#">Navbar</a>

            <!-- Collapse button -->
            <button
                class="navbar-toggler toggler-example"
                type="button"
                data-toggle="collapse"
                data-target="#navbarSupportedContent1"
                aria-controls="navbarSupportedContent1"
                aria-expanded="false"
                aria-label="Toggle navigation"
                ><span class="dark-blue-text"
                    ><i class="fas fa-bars fa-1x" /></span
                ></button
            >

            <!-- Collapsible content -->
            <div class="collapse navbar-collapse" id="navbarSupportedContent1">
                <!-- Links -->
                <ul class="navbar-nav mr-auto">
                    {#each navData as item}
                        <li class="nav-item">
                            <a class="nav-link" href={item.url}>{item.text}</a>
                        </li>
                    {/each}
                </ul>

                {#await loggedUserData}
                    <h1>Oczekiwanie na dane użytkownika</h1>
                {:then loggedUserData}
                    {#if loggedUserData.error_message}
                        <form class="d-flex">
                            <a
                                href="/register"
                                class="btn btn-sm btn-outline-primary"
                                >Register</a
                            >
                            <a
                                href="/login"
                                class="btn btn-sm btn-outline-success"
                                id="login-btn"
                            >
                                Login
                            </a>
                        </form>
                    {:else}
                        <span class="px-3">
                            Zalogowany jako: <strong
                                >{loggedUserData.userName}</strong
                            >
                        </span>

                        <a href="/logoutUser">Wyloguj</a>
                    {/if}
                {/await}
                <!-- Links -->
            </div>
            <!-- Collapsible content -->
        </nav>
        <!--/.Navbar-->
    {/if}
{/await}

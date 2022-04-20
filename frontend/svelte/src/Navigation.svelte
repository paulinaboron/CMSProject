<script>
    async function getLinks() {
        let response = await fetch(
            `http://localhost:5000/getLinks?component=header`,
            { method: "post" }
        );
        let responseJson = await response.json();
        console.log("response nav: ", responseJson);
        return responseJson;
    }

    async function getLoggedUser() {
        let response = await fetch(
            `http://localhost:5000/getLoggedUserData`,
            { method: "post" }
        );
        let responseJson = await response.json();
        console.log("response logUser: ", responseJson);
        return responseJson
    }

    let loggedUserData = getLoggedUser()
    let navData = getLinks();

    $: navData = getLinks();
    $: loggedUserData = getLoggedUser()
</script>

{#await navData}
    <h1>Oczekiwanie na dane nawigacji</h1>
{:then navData}
    <nav class="navbar navbar-expand-lg">
        <div class="container-fluid">
            <div class="collapse navbar-collapse" id="navbarScroll">
                <ul
                    class="navbar-nav me-auto my-2 my-lg-0 navbar-nav-scroll"
                    style="--bs-scroll-height: 100px"
                >
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
                            <a href="/register" class="btn btn-sm btn-outline-primary"
                                >Register</a
                            >
                            <a href="/login"
                                class="btn btn-sm btn-outline-success"
                                id="login-btn"
                            >
                                Login
                            </a>
                        </form>
                    {:else}
                        <span class="px-3">
                            Zalogowany jako: <strong>{loggedUserData.userName}</strong>
                        </span>
                        
                        <a href="/logoutUser"
                            >Wyloguj</a
                        >
                    {/if}
                {/await}
            </div>
        </div>
    </nav>
{/await}

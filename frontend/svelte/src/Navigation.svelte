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

    let navData = getLinks();

    $: {
        navData = getLinks();
    }
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
                <form class="d-flex">
                    <button class="btn btn-sm btn-outline-primary"
                        >Register</button
                    >
                    <button
                        class="btn btn-sm btn-outline-success"
                        id="login-btn"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    </nav>
{/await}

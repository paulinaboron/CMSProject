<script>
  import Search from "./Search.svelte";
  export let vertical;

  async function getLinks() {
    let response = await fetch(`/getLinks?component=header`, {
      method: "post",
    });
    let responseJson = await response.json();
    console.log("response nav: ", responseJson);
    return responseJson;
  }

  async function getLoggedUser() {
    let response = await fetch(`/getLoggedUserData`, { method: "post" });
    let responseJson = await response.json();
    console.log("response logUser: ", responseJson);
    return responseJson;
  }

  let loggedUserData = getLoggedUser();
  let navData = getLinks();

  $: navData = getLinks();
  $: loggedUserData = getLoggedUser();
</script>

{#await navData}
  <h1>Oczekiwanie na dane nawigacji</h1>
{:then navData}
  {#if vertical == "false"}
    <nav class="navbar navbar-expand-lg">
      <div class="container-fluid">
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon" />
        </button>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            {#each navData as item}
              <li class="nav-item">
                <a class="nav-link mt-1" href={item.url}>{item.text}</a>
              </li>
            {/each}

            {#await loggedUserData}
              <h1>Oczekiwanie na dane użytkownika</h1>
            {:then loggedUserData}
              {#if loggedUserData.error_message}
                <form class="d-flex">
                  <li class="nav-item nav-link">
                    <a href="/register" class="btn btn-sm btn-outline-primary"
                      >Register</a
                    >
                  </li>
                  <li class="nav-item nav-link">
                    <a
                      href="/login"
                      class="btn btn-sm btn-outline-success"
                      id="login-btn"
                    >
                      Login
                    </a>
                  </li>
                </form>
              {:else}
                <li class="nav-item nav-link mt-1">
                  <span class="mr-2">
                    Zalogowany jako: <strong>{loggedUserData.userName} </strong>
                  </span>

                  <a href="/logoutUser">Wyloguj</a>
                </li>
              {/if}
            {/await}
          </ul>
        </div>

        <Search />
      </div>
    </nav>
  {:else}
    <ul class="nav flex-column">
      {#each navData as item}
        <li class="nav-item">
          <a class="nav-link" href={item.url}>{item.text}</a>
        </li>
      {/each}
      {#await loggedUserData}
              <h1>Oczekiwanie na dane użytkownika</h1>
            {:then loggedUserData}
              {#if loggedUserData.error_message}
                <form>
                  <li class="nav-item nav-link">
                    <a href="/register" class="btn btn-sm btn-outline-primary"
                      >Register</a
                    >
                  </li>
                  <li class="nav-item nav-link">
                    <a
                      href="/login"
                      class="btn btn-sm btn-outline-success"
                      id="login-btn"
                    >
                      Login
                    </a>
                  </li>
                </form>
              {:else}
                <li class="nav-item nav-link">
                  <span class="mr-2">
                    Zalogowany jako: <strong>{loggedUserData.userName} </strong>
                  </span>

                  <a href="/logoutUser">Wyloguj</a>
                </li>
              {/if}
            {/await}
            <li class="nav-item nav-link">
                <Search/>
            </li>
    </ul>
  {/if}
{/await}

<script>
  import Search from "./Search.svelte";
  export let vertical;

  const setRootStyle = (key, val) => {
    document.documentElement.style.setProperty(key, val)
  }

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

  function getDarkModeSetting(callback) {
    fetch('/getDarkMode', {method: "POST"})
      .then(response => response.json())
      .then(data => callback(data.darkMode))
  }

  getDarkModeSetting((darkMode) => {
    console.log("DarkMode: ", darkMode)
    if(darkMode){
      console.log("DarkMode")
      setRootStyle("--bg-color", "black");
      setRootStyle("--card-color", "rgb(48, 48, 48)");
      setRootStyle("--font-color", "white");
      setRootStyle("--icon-color", "white");
      console.log("Zmienione")
    }
  })

  let loggedUserData = getLoggedUser();
  let navData = getLinks();

  $: navData = getLinks();
  $: loggedUserData = getLoggedUser();
</script>

{#await navData}
  <h1>Oczekiwanie na dane nawigacji</h1>
{:then navData}
  {#if !vertical}
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
                {#if loggedUserData.userName == "admin"}
                  <li class="nav-item">
                    <a class="nav-link mt-1" href="/admin">Admin</a>
                  </li>
                {/if}

                <li class="nav-item">
                  <a class=" nav-link mt-1" href="/profil"
                    >Zalogowany jako: <strong
                      >{loggedUserData.userName}
                    </strong></a
                  >
                </li>

                <li class="nav-item">
                  <a class="text-primary nav-link mt-1" href="/logoutUser"
                    >Wyloguj</a
                  >
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
          {#if loggedUserData.userName == "admin"}
            <li class="nav-item">
              <a class="nav-link" href="/admin">Admin</a>
            </li>
          {/if}

          <li class="nav-item">
            <a class="nav-link" href="/profile">
              Zalogowany jako: <strong>{loggedUserData.userName} </strong>
            </a>
          </li>
          <li class="nav-item">
            <a href="/logoutUser" class="nav-link text-primary">Wyloguj</a>
          </li>
        {/if}
      {/await}
      <li class="nav-item nav-link" style="width: 250px;">
        <Search />
      </li>
    </ul>
  {/if}
{/await}

<script>
  export let name;
</script>


<main>

  <!-- Nawigacja -->
  <nav class="navbar navbar-expand-lg">
    <div class="container-fluid">
      <div class="collapse navbar-collapse" id="navbarScroll">
        <ul
          class="navbar-nav me-auto my-2 my-lg-0 navbar-nav-scroll"
          style="--bs-scroll-height: 100px"
        >
          <li class="nav-item">
            <a class="nav-link active" aria-current="page" href="/">Home</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/">Link</a>
          </li>
        </ul>
        <form class="d-flex">
          <button class="btn btn-sm btn-outline-primary">Register</button>
          <button class="btn btn-sm btn-outline-success" id="login-btn">
            Login
          </button>
        </form>
      </div>
    </div>
  </nav>
  <h1>Hello {name}!</h1>
  <p>Main Svelte-Page</p>
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }
  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>

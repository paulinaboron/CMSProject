<script>
  async function getLinks() {
    let response = await fetch(
      `http://localhost:5000/getLinks?component=footer`,
      { method: "post" }
    );
    let responseJson = await response.json();
    console.log("response ff: ", responseJson);
    return responseJson;
  }

  let footerData = getLinks();

  $: {
    footerData = getLinks();
  }
  console.log("FooterData: ", footerData, footerData[0]);
</script>

{#await footerData}
  <h1>Oczekiwanie na dane stopki</h1>
{:then footerData}
  <div class="container">
    <footer class="py-3 my-4">
      <ul class="nav justify-content-center border-bottom pb-3 mb-3">
        {#each footerData as item}
          <li class="nav-item">
            <a href="{item.url}" class="nav-link px-2 text-muted">{item.text}</a>
          </li>
        {/each}

        <li class="nav-item">
          <a href="/" class="nav-link px-2 text-muted">Features</a>
        </li>
        <li class="nav-item">
          <a href="/" class="nav-link px-2 text-muted">Pricing</a>
        </li>
        <li class="nav-item">
          <a href="/" class="nav-link px-2 text-muted">FAQs</a>
        </li>
        <li class="nav-item">
          <a href="/" class="nav-link px-2 text-muted">About</a>
        </li>
      </ul>
      <p class="text-center text-muted">© 2021 Company, Inc</p>
    </footer>
  </div>
{/await}

<script>
    import Navigation from "./Navigation.svelte";
    import Footer from "./Footer.svelte";
    import Card from "./Card.svelte"

    let ids = new URLSearchParams(window.location.search).get("ids").split(',');
  </script>
  
  <main>
    <Navigation />
    <div class="container">

    </div>
    <h1>Wyniki wyszukiwania</h1>

    {#each ids as id}
      <Card id={id}/>
    {/each}

    <Footer sticky={true}/>
  </main>
  
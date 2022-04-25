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
    <h1 class="text-center py-3">Wyniki wyszukiwania</h1>

    <div class="d-flex flex-row bd-highlight mb-3 news-div content">
      {#each ids as id}
        <Card id={id}/>
      {/each}
    </div>
    

    <Footer sticky={true}/>
  </main>
  
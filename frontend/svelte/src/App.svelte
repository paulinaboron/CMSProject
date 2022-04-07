<script>
  export let name;
  import Navigation from "./Navigation.svelte"
  import Slider from "./Slider.svelte"
  import Footer from "./Footer.svelte"
  import Card from "./Card.svelte"
  import Featurette from "./Featurette.svelte"

  console.log("Name: ", name);
</script>


<main>

  <Navigation/>
  <Slider id=1/>
  <div id="content">
    <div class="d-flex flex-row bd-highlight mb-3 news-div">
      <Card id=1/>
      <Card id=2/>
      <Card id=3/>
    </div>
  
  <Featurette id=1/>

  
  <Footer/>
</div>


</main>

<style>

</style>

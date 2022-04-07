<script>
  export let name;
  import Navigation from "./Navigation.svelte"
  import Slider from "./Slider.svelte"
  import Footer from "./Footer.svelte"
  import Card from "./Card.svelte"
  import Featurette from "./Featurette.svelte"

  console.log(name);
</script>


<main>

  <Navigation/>
  <Slider id=1/>
  <Card/>
  <Featurette/>

  
  <Footer/>


</main>

<style>

</style>

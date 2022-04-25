<script>
  export let name;
  import Navigation from "./Navigation.svelte";
  import Slider from "./Slider.svelte";
  import Footer from "./Footer.svelte";
  import News from "./News.svelte";
  import Featurette from "./Featurette.svelte";

  console.log("Name: ", name);
</script>

<main>
  <Navigation vertical="true"/>
  <Slider id="1" />
  <News />
  <Featurette id="1" />
  <Footer />
</main>

<style>
</style>

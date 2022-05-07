<script>
	import Navigation from "./Navigation.svelte";
	import Slider from "./Slider.svelte";
	import Footer from "./Footer.svelte";
	import News from "./News.svelte";
	import Featurette from "./Featurette.svelte";

	const getTemplateComponents = async () => {
		let response = await fetch("/getComponentsInCurrentTemplate");
		let responseJSON = await response.json();
		return responseJSON;
	};

	$: templateComponents = getTemplateComponents();
</script>

<main>
	<Navigation />

	{#await templateComponents then templateComponents}
		{#each templateComponents as component, idx}
			{#if component.type == "slider"}
				<Slider id={component.dbID} />
			{:else if component.type == "featurette"}
				<Featurette id={component.dbID} />
			{:else if component.type == "news"}
				<News />
			{/if}
		{/each}
	{/await}
	<Footer />
</main>

<!--
<main>
	<Navigation />
	<Slider id={1} />
	<News />
	<Featurette id={1} />
	<Footer />
</main>
-->
<style>
</style>

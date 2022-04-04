<script>
	export let name;
	import Router from "svelte-spa-router";
	import Article from "./routes/Article.svelte";
	import Page from "./routes/Page.svelte";
</script>

<main>
	App

	<Router
		routes={{
			"/": Page,
			"/articles": Article,
			"/article/:id/": Article,
		}}
	/>
</main>

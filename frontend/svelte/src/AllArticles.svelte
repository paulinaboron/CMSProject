<script>
	import Card from "./Card.svelte";
	import Navigation from "./Navigation.svelte";
	import Footer from "./Footer.svelte";

	async function getAllArticles() {
		let response = await fetch(`/getLatestArticlesIDs`, {
			method: "post"
		});
		let responseJson = await response.json();
		console.log("allArticles: ", responseJson);
		return responseJson;
	}

	$: articles = getAllArticles();
</script>

<main>
	<Navigation />

	<h1 class="text-center p-4">Artykuły</h1>
	<div class="d-flex flex-row bd-highlight mb-3 news-div content">
		{#await articles then articles}
			{#each articles.latestArticlesIDs as article}
				<Card id={article} />
			{/each}
		{/await}
	</div>

	<Footer sticky={true} />
</main>

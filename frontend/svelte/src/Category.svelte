<script>
	import Navigation from "./Navigation.svelte";
	import Footer from "./Footer.svelte";
	import Card from "./Card.svelte";

	let params = new URLSearchParams(window.location.search);
	let id = params.get("id");

	async function getCategoryData(id) {
		let response = await fetch(`/getCategoryData?id=${id}`, { method: "POST" });
		let responseJson = await response.json();
		return responseJson;
	}

	$: categoryData = getCategoryData(id);
</script>

<Navigation />

{#await categoryData}
	<p>Oczekiwanie na dane kategorii</p>
{:then categoryData}
	<br /><br />
	<h2 class="text-center">
		{categoryData.error_message ? categoryData.error_message : categoryData.name}
	</h2>

	{#if !categoryData.error_message && categoryData.articles.length > 0}
		<div class="container d-flex flex-row bd-highlight mb-3 news-div">
			{#each categoryData.articles as article}
				<Card id={article} />
			{/each}
		</div>
	{/if}
{/await}

<Footer sticky={true} />

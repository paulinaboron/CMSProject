<script>
    import Card from "./Card.svelte"

    async function getLatestArticles(count) {
		let response = await fetch(`/getLatestArticlesIDs?count=${count}`, { method: "post" });
		let responseJson = await response.json();
		return responseJson;
	}

	let latestArticles = getLatestArticles(3);

	$: {
		latestArticles = getLatestArticles(3);
	}
</script>


<div class="d-flex flex-row bd-highlight mb-3 news-div content">
    {#await latestArticles then latestArticles}
        {#each latestArticles.latestArticlesIDs as latestArticle}
            <Card id={latestArticle} />
        {/each}
    {/await}
  </div>
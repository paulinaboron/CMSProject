<script>
	export let params = {};

	async function getArticleData(id) {
		let response = await fetch(`http://localhost:5000/getArticleData?id=${id}`, { method: "post" });
		let responseJson = await response.json();
		return responseJson;
	}
	let articleData = getArticleData(params.id);

	$: {
		articleData = getArticleData(params.id);
	}
</script>

{#await articleData then articleData}
	{#if articleData.error_message}
		{articleData.error_message}
	{:else}
		<h1>{articleData.title}</h1>
		<h2>{articleData.subtitle}</h2>
		<h6>{articleData.creation_date}</h6>
		<p>{articleData.content}</p>
	{/if}
{/await}

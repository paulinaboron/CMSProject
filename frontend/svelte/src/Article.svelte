<script>
	import Gallery from "./Gallery.svelte"
	import Comments from "./Comments.svelte"

	let params = new URLSearchParams(window.location.search);
	let id = params.get("id");
	console.log("Article ID: ", id);

	async function getArticleData(id) {
		let response = await fetch(
			`http://localhost:5000/getArticleData?id=${id}`,
			{ method: "post" }
		);
		let responseJson = await response.json();
		return responseJson;
	}
	let articleData = getArticleData(id);

	$: {
		articleData = getArticleData(id);
	}
</script>

{#await articleData then articleData}
	{#if articleData.error_message}
		<p>{articleData.error_message}</p>
	{:else}
		<div class="position-relative text-center article-top">
			<div class="col-md-5 p-lg-5 mx-auto">
				<h1 class="display-4">{articleData.title}</h1>
				<p class="lead">
					{articleData.subtitle}
				</p>
			</div>
		</div>
		<Gallery/>
		<br>
		<div id="article-content">
			<p>
				{articleData.content}
			</p>
			<p>{articleData.creation_date}</p>
		</div>
		<Comments/>
		<br>
	{/if}
{/await}

<script>
	import Gallery from "./Gallery.svelte";
	import Comments from "./Comments.svelte";
	import Navigation from "./Navigation.svelte";
	import Footer from "./Footer.svelte";

	let params = new URLSearchParams(window.location.search);
	let id = params.get("id");
	console.log("Article ID: ", id);

	async function getArticleData(id) {
		let response = await fetch(`/getArticleData?id=${id}`, { method: "post" });
		let responseJson = await response.json();
		console.log(responseJson.content);
		console.log(responseJson.content.replace("\u0009", "asd"));
		console.log("Article: ", responseJson);
		return responseJson;
	}
	let articleData = getArticleData(id);

	$: {
		articleData = getArticleData(id);
	}
</script>

<Navigation />

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
		<Gallery id={articleData.connected_gallery_id} />
		<br />
		<div id="article-content">
			<p>
				{@html articleData.content}
			</p>
			<p>{articleData.creation_date}</p>
		</div>
		<Comments />
		<br />
	{/if}
{/await}

<Footer />

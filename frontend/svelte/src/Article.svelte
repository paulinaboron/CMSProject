<script>
	let params = new URLSearchParams(window.location.search)
	let id =  params.get("id")
	console.log(id)

	async function getArticleData(id) {
		let response = await fetch(`http://localhost:5000/getArticleData?id=${id}`, { method: "post" });
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
		{articleData.error_message}
	{:else}
		<h6>{articleData.creation_date}</h6>

		<div class="position-relative text-center">
			<div class="col-md-5 p-lg-5 mx-auto">
			<h1 class="display-4">{articleData.title}</h1>
			<p class="lead">
				{articleData.subtitle}
			</p>
			</div>
		</div>
		<div id="article-content">
			<!-- svelte-ignore a11y-img-redundant-alt -->
			<img src="../uploads/slider/gray3.jpg" class="article-img" alt="Article Image"/>
			<p>
				{articleData.content}
			</p>
		</div>

	{/if}
{/await}




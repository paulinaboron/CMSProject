<script>
	export let id;

	async function getArticleData(id) {
		let response = await fetch(`/getArticleData?id=${id}`, { method: "post" });
		let responseJson = await response.json();
		return responseJson;
	}
	let cardData = getArticleData(id);

	$: {
		cardData = getArticleData(id);
	}

</script>

{#await cardData}
	<h1>Oczekiwanie na dane atykułu</h1>
{:then cardData}
	<div class="card" style="width: 18rem">
		<div class="card-body">
			<h5 class="card-title">{cardData.title}</h5>
			<p class="card-text">
				{cardData.subtitle}
			</p>
			<a href="./article?id={id}" class="btn btn-secondary card-button">Go to article</a>
		</div>
	</div>
{/await}

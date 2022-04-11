<script>
	export let id;
	console.log("ID Featurette: ", id);

	async function getFeaturetteData(id) {
		let response = await fetch(`http://localhost:5000/getFeaturetteData?id=${id}`, { method: "post" });
		let responseJson = await response.json();
		console.log("responseJson: ", responseJson);
		return responseJson;
	}

	let featData = getFeaturetteData(id);
	console.log("FeatData: ", featData, featData.title);
</script>

{#await featData then featData}
	<hr class="featurette-divider" />
	<div class="featurette">
		<div>
			<h2 class="featurette-heading">
				{featData.title}
				<span class="text-muted">{featData.subtitle}</span>
			</h2>
			<p class="lead">
				{featData.content}
			</p>
		</div>
		<div>
			<!-- svelte-ignore a11y-img-redundant-alt -->
			<img src={`/uploads/featurettes/${featData.img_url}`} alt="Featurette Image" />
			<!-- src = featData.img_url -->
		</div>
	</div>
	<hr class="featurette-divider" />
{/await}

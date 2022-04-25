<script>
	export let id;
	console.log("ID Featurette: ", id);

	async function getFeaturetteData(id) {
		let response = await fetch(`/getFeaturetteData?id=${id}`, { method: "post" });
		let responseJson = await response.json();
		console.log("responseJson: ", responseJson);
		return responseJson;
	}

	let featData = getFeaturetteData(id);
	console.log("FeatData: ", featData, featData.title);
</script>

{#await featData then featData}
<div class="content">
	<hr class="featurette-divider" />
	<div class="featurette row">
		<div class="featurette-text col-12 col-lg-5 col-xl-6">
			<h2 class="featurette-heading">
				{featData.title}
				<span class="text-muted">{featData.subtitle}</span>
			</h2>
			<p class="lead">
				{featData.content}
			</p>
		</div>
		<div class="col-12 col-lg-7 col-xl-6 d-flex justify-center">
			<!-- svelte-ignore a11y-img-redundant-alt -->
			<img src={`/uploads/featurettes/${featData.img_url}`} alt="Featurette Image" />
		</div>
	</div>
	<hr class="featurette-divider" />
</div>
	
{/await}

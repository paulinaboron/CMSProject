<script>
	let getAllFeaturettes = async () => {
		let response = await fetch(
			"http://localhost:5000/adminGetAllFeaturettes",
			{ method: "POST" }
		);
		let responseJSON = await response.json();
		console.log(responseJSON);
	};

	let featurettesData = getAllFeaturettes();
</script>

<div class="tab-content">
	<div class="tab-pane active" id="featurettes">
		<nav
			class="nav nav-pills justify-content-start flex-column flex-md-row mb-3"
		>
			<a
				href="#featurettes-composition"
				class="nav-link active"
				data-bs-toggle="tab">Composition</a
			>
			<a href="#featurettes-images" class="nav-link" data-bs-toggle="tab"
				>Images</a
			>
		</nav>
		<div class="tab-content">
			<div class="tab-pane active" id="featurettes-composition">
				<p class="h1">Featurettes composition</p>
			</div>
			<div class="tab-pane" id="featurettes-images">
				<p class="h1">Featurettes images</p>
			</div>
		</div>
	</div>
</div>

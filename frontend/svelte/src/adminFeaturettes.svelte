<script>
	let getAllFeaturettes = async () => {
		let response = await fetch(
			"http://localhost:5000/adminGetAllFeaturettes",
			{ method: "POST" }
		);
		let responseJSON = await response.json();
		return await responseJSON;
	};

	let currentID;
	let featurettesData = [];
	let title = "";
	let subtitle = "";
	let content = "";
	let imagePath = "";

	getAllFeaturettes().then((data) => {
		featurettesData = data;
		console.log(featurettesData);
		if (featurettesData[0]) {
			title = featurettesData[0][1];
			subtitle = featurettesData[0][2];
			content = featurettesData[0][3];
			imagePath = featurettesData[0][4];
		}
	});

	const changeData = () => {
		title = featurettesData[currentID][1];
		subtitle = featurettesData[currentID][2];
		content = featurettesData[currentID][3];
		imagePath = featurettesData[currentID][4];
	};

	const addNew = () => {
		[title, subtitle, content, imagePath] = ["", "", "", ""];
		featurettesData = [
			...featurettesData,
			[featurettesData.length + 1, "", "", "", ""]
		];
	};
</script>

<div class="tab-content">
	<div class="tab-pane active" id="featurettes">
		<nav
			class="nav nav-pills justify-content-start flex-column flex-md-row mb-3 mx-3"
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
			<div class="tab-pane container active" id="featurettes-composition">
				<p class="h1 mb-3">Featurette</p>
				{#await featurettesData then featurettesData}
					<div
						class="container d-flex justify-content-start gap-2 align-items-center mb-2 p-0 col-sm-10 col-md-8 mx-auto"
					>
						<!-- svelte-ignore a11y-no-onchange -->
						<select
							class="form-select-sm px-5"
							bind:value={currentID}
							on:change={changeData}
						>
							{#each featurettesData as featurette, idx}
								<option value={idx}>
									{featurette[0]}
								</option>
							{/each}
						</select>
						<button
							class="btn btn-sm btn-primary px-3"
							on:click={addNew}
						>
							+
						</button>
					</div>
					<form class="col-sm-10 col-md-8 mx-auto" onSub>
						<label
							for="input-first-credential mt-2"
							class="form-label">Tytuł</label
						>
						<input
							type="text"
							class="form-control"
							id="title"
							bind:value={title}
						/>
						<label
							for="input-first-credential"
							class="form-label mt-2">Podtytuł</label
						>
						<input
							type="text"
							class="form-control"
							id="subtitle"
							bind:value={subtitle}
						/>
						<label
							for="input-first-credential"
							class="form-label mt-2">Treść</label
						>
						<input
							type="text"
							class="form-control"
							id="content"
							bind:value={content}
						/>
						<label
							for="input-first-credential"
							class="form-label mt-2">Obrazek</label
						>
						<input
							type="text"
							class="form-control"
							id="imgaePath"
							bind:value={imagePath}
						/>
					</form>
				{/await}
			</div>
			<div class="tab-pane container" id="featurettes-images">
				<p class="h1">Featurettes images</p>
			</div>
		</div>
	</div>
</div>

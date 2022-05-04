<script>
	let getAllFeaturettes = async () => {
		let response = await fetch("http://localhost:5000/adminGetAllFeaturettes", { method: "POST" });
		let responseJSON = await response.json();
		return await responseJSON;
	};

	let currentID = 0;
	let featurettesData = [];
	let title = "";
	let subtitle = "";
	let content = "";
	let imagePath = "";

	const getData = () => {
		getAllFeaturettes().then((data) => {
			featurettesData = data;
			if (featurettesData.length > 0) {
				changeData();
			}
		});
	};

	const changeData = () => {
		title = featurettesData[currentID][1];
		subtitle = featurettesData[currentID][2];
		content = featurettesData[currentID][3];
		imagePath = featurettesData[currentID][4];
	};

	const addNew = () => {
		featurettesData = [...featurettesData, [0, "", "", "", ""]];
		currentID = featurettesData.length - 1;
		changeData();
	};

	const saveRecord = () => {
		fetch("http://localhost:5000/adminSaveFeaturette", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				id: featurettesData[currentID][0],
				title,
				subtitle,
				content,
				imagePath
			})
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.state == "valid") {
					getData();
				}
			});
	};

	const deleteRecord = () => {
		if (featurettesData.length == 0) return;

		if (featurettesData[currentID][0] == 0) {
			featurettesData = featurettesData.filter((elem, idx) => {
				return idx != currentID;
			});
			currentID = featurettesData.length - 1;
			changeData();
		} else {
			fetch("http://localhost:5000/adminDeleteFeaturette", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					id: featurettesData[currentID][0]
				})
			})
				.then((response) => response.json())
				.then((data) => {
					if (data.state == "valid") {
						getData();
						currentID = featurettesData.length - 2;
						changeData();
					}
				});
		}
	};

	getData();
</script>

<div class="tab-pane container" id="featurettes">
	<nav class="nav nav-pills justify-content-start flex-column flex-md-row mb-3 mx-3">
		<a href="#featurettes-composition" class="nav-link active" data-bs-toggle="tab">Composition</a>
		<a href="#featurettes-images" class="nav-link" data-bs-toggle="tab">Images</a>
	</nav>
	<div class="tab-content">
		<div class="tab-pane container active" id="featurettes-composition">
			<p class="h1 mb-3">Featurette</p>
			{#await featurettesData then featurettesData}
				<div class="container d-flex justify-content-start gap-2 align-items-center mb-3 col-sm-10 col-md-8 mx-auto">
					<!-- svelte-ignore a11y-no-onchange -->
					<select class="form-select-sm col-4" bind:value={currentID} on:change={changeData}>
						{#each featurettesData as featurette, idx}
							<option value={idx}>
								{featurette[0] == 0 ? "*NOWY*" : featurette[0]}
							</option>
						{/each}
					</select>
					<button class="btn btn-sm btn-primary px-3" on:click={addNew}> <span class="fw-bold">+</span> </button>
					<button class="btn btn-sm btn-outline-danger px-3" on:click={deleteRecord}> <span class="fw-bold">×</span> </button>
				</div>
				<div class="container col-sm-10 col-md-8 mx-auto">
					<label for="featuretteTitle" class="form-label mb-0">Tytuł</label>
					<input type="text" class="form-control" id="featuretteTitle" bind:value={title} />

					<label for="featuretteSubtitle" class="form-label mt-2 mb-0">Podtytuł</label>
					<input type="text" class="form-control" id="featuretteSubtitle" bind:value={subtitle} />

					<label for="featuretteContent" class="form-label mt-2 mb-0">Treść</label>
					<textarea type="text" class="form-control" id="featuretteContent" bind:value={content} />

					<label for="featuretteImagePath" class="form-label mt-2 mb-0">Obrazek</label>
					<input type="text" class="form-control" id="featuretteImagePath" bind:value={imagePath} />

					<button on:click={saveRecord} class="btn btn-primary mt-4"> Zapisz </button>
				</div>
			{/await}
		</div>
		<div class="tab-pane container" id="featurettes-images">
			<p class="h1">Featurettes images</p>
		</div>
	</div>
</div>

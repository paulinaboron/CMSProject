<script>
	export let admTemplates;

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

	let uploadFiles = [];
	let featuretteImages = [];

	const getFeaturettesImages = () => {
		fetch("http://localhost:5000/adminGetFeaturetteImages", {
			method: "POST"
		})
			.then((response) => response.json())
			.then((data) => {
				featuretteImages = data;
			});
	};

	const getData = () => {
		getFeaturettesImages();
		getAllFeaturettes().then((data) => {
			featurettesData = data;
			changeData();
		});
	};

	const changeData = () => {
		if (featurettesData.length > 0) {
			title = featurettesData[currentID][1];
			subtitle = featurettesData[currentID][2];
			content = featurettesData[currentID][3];
			imagePath = featurettesData[currentID][4];
		} else {
			[title, subtitle, content, imagePath] = ["", "", "", ""];
		}
	};

	const addNew = () => {
		featurettesData = [...featurettesData, [0, "", "", "", ""]];
		currentID = featurettesData.length - 1;
		changeData();
	};

	const saveRecord = () => {
		if (featurettesData.length == 0) return;
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
					admTemplates.getData();
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
						admTemplates.getData();
					}
				});
		}
	};

	const uploadFeaturetteImages = () => {
		if (uploadFiles.length == 0) return;

		for (let file of uploadFiles) {
			let formData = new FormData();
			formData.append("file", file);

			fetch("http://localhost:5000/adminUploadFeaturetteImages", {
				method: "POST",
				body: formData
			})
				.then((response) => response.json())
				.then(() => {
					getData();
				});
		}

		uploadFiles = [];
	};

	getData();
</script>

<div class="tab-pane container" id="featurettes">
	<nav class="nav nav-pills justify-content-start flex-column flex-md-row mb-3 mx-3">
		<a href="#featurettes-composition" class="nav-link active" data-bs-toggle="tab">Featurettes</a>
		<a href="#featurettes-images" class="nav-link" data-bs-toggle="tab">Upload</a>
	</nav>
	<div class="tab-content">
		<div class="tab-pane container active" id="featurettes-composition">
			<p class="h1 mb-3">Featurettes</p>
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
					<label for="featuretteTitle" class="form-label">Tytuł</label>
					<input type="text" class="form-control" id="featuretteTitle" bind:value={title} />

					<label for="featuretteSubtitle" class="form-label mt-3">Podtytuł</label>
					<input type="text" class="form-control" id="featuretteSubtitle" bind:value={subtitle} />

					<label for="featuretteContent" class="form-label mt-3">Treść</label>
					<textarea type="text" class="form-control" id="featuretteContent" bind:value={content} />

					<label for="featuretteImagePath" class="form-label mt-3">Obrazek</label>
					<select class="form-control form-select" bind:value={imagePath}>
						{#each featuretteImages as image}
							<option value={image}>{image}</option>
						{/each}
					</select>

					<button on:click={saveRecord} class="btn btn-primary mt-4"> Zapisz </button>
				</div>
			{/await}
		</div>
		<div class="tab-pane container" id="featurettes-images">
			<p class="h1">Upload</p>

			<div class="container col-6">
				<input name="file" type="file" bind:files={uploadFiles} multiple accept="image/*" class="form-control mt-4" />
				<button on:click={uploadFeaturetteImages} type="button" class="btn btn-success mt-3">Wgraj</button>
			</div>

			<div class="container col-8 mt-4">
				<table class="table table-striped">
					<thead>
						<tr>
							<th class="text-center" scope="col">Nazwa</th>
							<th class="text-start" scope="col">Podgląd</th>
						</tr>
					</thead>
					<tbody>
						{#each featuretteImages as image}
							<tr>
								<td class="text-center fw-bold">{image}</td>
								<td class="text-start lh-1">
									<img class="img-preview" src={`http://localhost:5000/uploads/featurettes/${image}`} alt={image} />
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>

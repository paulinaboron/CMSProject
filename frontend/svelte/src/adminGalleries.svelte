<script>
	export let admArticles;

	let getAllGalleries = async () => {
		let response = await fetch("http://localhost:5000/adminGetAllGalleries", { method: "POST" });
		let responseJSON = await response.json();
		return await responseJSON;
	};

	let galleriesData = [];
	let currentID = 0;
	let id = 0;
	let name = "";
	let newImagePath = "";
	let photos = [];
	let editedImagePath = "";

	let uploadFiles = [];
	let galleriesImages = [];
	let currentlyEdited = 0;

	const getGalleriesImages = () => {
		fetch("http://localhost:5000/adminGetGalleriesImages", {
			method: "POST"
		})
			.then((response) => response.json())
			.then((data) => {
				console.log(data);
				galleriesImages = data;
			});
	};

	const getData = () => {
		getAllGalleries().then((data) => {
			galleriesData = data;
			getGalleriesImages();
			changeData();
		});
	};

	const addGallery = () => {
		galleriesData = [...galleriesData, [0, "", []]];
		currentID = galleriesData.length - 1;
		changeData();
	};

	const saveGallery = () => {
		if (galleriesData.length == 0) return;
		fetch("http://localhost:5000/adminSaveGallery", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				id: galleriesData[currentID][0],
				name
			})
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.state == "valid") {
					getData();
					admArticles.init();
				}
			});
	};

	const deleteGallery = () => {
		if (galleriesData.length == 0) return;

		if (galleriesData[currentID][0] == 0) {
			galleriesData = galleriesData.filter((elem, idx) => {
				return idx != currentID;
			});
			currentID = galleriesData.length - 1;
			changeData();
		} else {
			fetch("http://localhost:5000/adminDeleteGallery", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					id: galleriesData[currentID][0]
				})
			})
				.then((response) => response.json())
				.then((data) => {
					if (data.state == "valid") {
						currentID = galleriesData.length - 2;
						getData();
						admArticles.init();
					}
				});
		}
	};

	const savePhoto = () => {
		fetch("http://localhost:5000/adminSavePhoto", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				id: currentlyEdited,
				newImagePath: editedImagePath
			})
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.state == "valid") {
					getData();
					currentlyEdited = 0;
					editedImagePath = "";
					admArticles.init();
				}
			});
	};

	const addPhoto = () => {
		fetch("http://localhost:5000/adminAddPhoto", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				galleryID: galleriesData[currentID][0],
				imagePath: newImagePath
			})
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.state == "valid") {
					newImagePath = "";
					getData();
				}
			});
	};

	const deletePhoto = (id) => {
		fetch("http://localhost:5000/adminDeletePhoto", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				id
			})
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.state == "valid") {
					getData();
				}
			});
	};

	const changeData = () => {
		if (galleriesData.length > 0) {
			id = galleriesData[currentID][0];
			name = galleriesData[currentID][1];
			photos = galleriesData[currentID][2];
		} else {
			[id, name, photos] = ["", "", []];
		}
	};

	const uploadGalleryImages = () => {
		if (uploadFiles.length == 0) return;

		for (let file of uploadFiles) {
			let formData = new FormData();
			formData.append("file", file);

			fetch("http://localhost:5000/adminUploadGalleryImages", {
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

<div class="tab-pane container" id="galleries">
	<nav class="nav nav-pills justify-content-start flex-column flex-md-row mb-3 mx-3">
		<a href="#galleries-composition" class="nav-link active" data-bs-toggle="tab">Galleries</a>
		<a href="#galleries-images" class="nav-link" data-bs-toggle="tab">Upload</a>
	</nav>

	<div class="tab-content">
		<div class="tab-pane container active" id="galleries-composition">
			<p class="h1 mb-3">Galleries</p>
			<div class="container d-flex justify-content-start gap-2 align-items-center mb-3 col-sm-10 col-md-8 mx-auto">
				<!-- svelte-ignore a11y-no-onchange -->
				<select class="form-select-sm col-8" bind:value={currentID} on:change={changeData}>
					{#each galleriesData as gallery, idx}
						<option value={idx}>
							{gallery[0] == 0 ? "*NOWA*" : `${gallery[0]} - ${gallery[1]}`}
						</option>
					{/each}
				</select>
				<button class="btn btn-sm btn-primary px-3" on:click={addGallery}> <span class="fw-bold">+</span> </button>
				<button class="btn btn-sm btn-outline-danger px-3" on:click={deleteGallery}> <span class="fw-bold">×</span> </button>
			</div>
			<div class="container col-sm-10 col-md-8 mx-auto">
				<label for="galleryName" class="form-label">Nazwa</label>
				<input type="text" class="form-control" id="galleryName" bind:value={name} />

				<button on:click={saveGallery} class="btn btn-primary mt-4"> Zapisz </button>
			</div>

			{#if id != 0}
				<div class="container col-8 my-4">
					<span class="form-label">Fotografie</span>
					<table class="table table-striped">
						<thead>
							<tr>
								<th scope="column"> ID </th>
								<th scope="column"> Obraz </th>
								<th scope="column" />
							</tr>
						</thead>
						<tbody>
							{#each photos as photo}
								<tr>
									<th scope="col" class="pt-3">
										{photo[0]}
									</th>
									<td class="pt-3">
										{#if photo[0] == currentlyEdited}
											<select class="form-control form-select-sm" bind:value={editedImagePath}>
												{#each galleriesImages as image}
													<option value={image}>{image}</option>
												{/each}
											</select>
										{:else}
											{photo[2]}
										{/if}
									</td>
									<td>
										{#if photo[0] == currentlyEdited}
											<button on:click={savePhoto} class="btn btn-sm btn-outline-primary my-1">Zapisz</button>
											<button
												on:click={() => {
													currentlyEdited = 0;
													editedImagePath = "";
												}}
												class="btn btn-sm btn-outline-danger ms-3 my-1">Anuluj</button
											>
										{:else}
											<button
												on:click={() => {
													currentlyEdited = photo[0];
													editedImagePath = photo[2];
												}}
												class="btn btn-sm btn-primary my-1">Edytuj</button
											>
											<button on:click={() => deletePhoto(photo[0])} class="btn btn-sm btn-outline-danger ms-3 my-1"
												>Usuń</button
											>
										{/if}
									</td>
								</tr>
							{/each}

							<tr>
								<th scope="row" class="pt-3"> Nowa </th>
								<td class="pt-3">
									<input type="text" class="form-control form-control-sm" bind:value={newImagePath} />
								</td>
								<td>
									<button on:click={addPhoto} class="btn btn-sm btn-success my-2">Dodaj</button>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			{/if}
		</div>
		<div class="tab-pane container" id="galleries-images">
			<p class="h1">Upload</p>

			<div class="container col-6">
				<input name="file" type="file" bind:files={uploadFiles} multiple accept="image/*" class="form-control mt-4" />
				<button on:click={uploadGalleryImages} type="button" class="btn btn-success mt-3">Wgraj</button>
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
						{#each galleriesImages as image}
							<tr>
								<td class="text-center fw-bold">{image}</td>
								<td class="text-start lh-1">
									<img class="img-preview" src={`http://localhost:5000/uploads/galleries/${image}`} alt={image} />
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>

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
	let currentlyEdited = 0;

	const getData = () => {
		getAllGalleries().then((data) => {
			galleriesData = data;
			console.log("Galleries", galleriesData);
			if (galleriesData.length > 0) {
				changeData();
			}
		});
	};

	const addGallery = () => {
		galleriesData = [...galleriesData, [0, "", []]];
		currentID = galleriesData.length - 1;
		changeData();
	};

	const saveGallery = () => {
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
						getData();
						currentID = galleriesData.length - 2;
						changeData();
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
			[id, name, photos] = ["", "", ""];
		}
	};

	getData();
</script>

<div class="tab-pane container" id="galleries">
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
		<label for="articleTitle" class="form-label">Nazwa</label>
		<input type="text" class="form-control" id="articleTitle" bind:value={name} />

		<button on:click={saveGallery} class="btn btn-primary mt-4"> Zapisz </button>
	</div>

	{#if id != 0}
		<div class="container col-8 my-3">
			<span class="form-label">Fotografie</span>
			<table class="table table-striped">
				<thead>
					<tr>
						<th scope="column"> ID </th>
						<th scope="column"> Nazwa </th>
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
									<input bind:value={editedImagePath} type="text" class="form-control form-control-sm" />
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

<script>
	export let admTemplates;

	let slidersData = [];
	let currentID = 0;
	let id = 0;
	let name = "";
	let interval = 5000;
	let slides = [];
	let currentlyEdited = 0;
	let editedImagePath = "";
	let editedTitle = "";
	let editedSubtitle = "";
	let newImagePath = "";
	let newTitle = "";
	let newSubtitle = "";
	let uploadFiles = [];
	let sliderImages = [];

	const getData = () => {
		fetch("/adminGetAllSliders", { method: "POST" })
			.then((response) => response.json())
			.then((data) => {
				slidersData = data;
				changeData();
				getSliderImages();
			});
	};

	const getSliderImages = () => {
		fetch("/adminGetSliderImages", {
			method: "POST"
		})
			.then((response) => response.json())
			.then((data) => {
				sliderImages = data;
			});
	};

	const addSlider = () => {
		slidersData = [...slidersData, [0, "", 5000, []]];
		currentID = slidersData.length - 1;
		changeData();
	};

	const saveSlider = () => {
		if (slidersData.length == 0) return;
		fetch("/adminSaveSlider", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				id: slidersData[currentID][0],
				name,
				interval
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

	const deleteSlider = () => {
		if (slidersData.length == 0) return;

		if (slidersData[currentID][0] == 0) {
			slidersData = slidersData.filter((elem, idx) => {
				return idx != currentID;
			});
			currentID = slidersData.length - 1;
			changeData();
		} else {
			fetch("/adminDeleteSlider", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					id: slidersData[currentID][0]
				})
			})
				.then((response) => response.json())
				.then((data) => {
					if (data.state == "valid") {
						currentID = slidersData.length - 2;
						getData();
						admTemplates.getData();
					}
				});
		}
	};

	const saveSlide = () => {
		fetch("/adminSaveSlide", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				id: currentlyEdited,
				newImagePath: editedImagePath,
				newTitle: editedTitle,
				newSubtitle: editedSubtitle
			})
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.state == "valid") {
					getData();
					currentlyEdited = 0;
					editedImagePath = "";
				}
			});
	};

	const addSlide = () => {
		fetch("/adminAddSlide", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				sliderID: slidersData[currentID][0],
				imagePath: newImagePath,
				title: newTitle,
				subtitle: newSubtitle
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

	const deleteSlide = (id) => {
		fetch("/adminDeleteSlide", {
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
		if (slidersData.length > 0) {
			id = slidersData[currentID][0];
			name = slidersData[currentID][1];
			interval = slidersData[currentID][2];
			slides = slidersData[currentID][3];
		} else {
			[id, name, interval, slides] = ["", "", 5000, []];
		}
	};

	const uploadSliderImages = () => {
		if (uploadFiles.length == 0) return;

		for (let file of uploadFiles) {
			let formData = new FormData();
			formData.append("file", file);

			fetch("/adminUploadSliderImages", {
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

<div class="tab-pane container" id="sliders">
	<nav class="nav nav-pills justify-content-start flex-column flex-md-row mb-3 mx-3">
		<a href="#sliders-composition" class="nav-link active" data-bs-toggle="tab">Sliders</a>
		<a href="#sliders-images" class="nav-link" data-bs-toggle="tab">Upload</a>
	</nav>
	<div class="tab-content">
		<div class="tab-pane container active" id="sliders-composition">
			<p class="h1 mb-3">Sliders</p>
			<div class="container d-flex justify-content-start gap-2 align-items-center mb-3 col-sm-10 col-md-8 mx-auto">
				<!-- svelte-ignore a11y-no-onchange -->
				<select class="form-select-sm col-8" bind:value={currentID} on:change={changeData}>
					{#each slidersData as slider, idx}
						<option value={idx}>
							{slider[0] == 0 ? "*NOWY*" : `${slider[0]} - ${slider[1]}`}
						</option>
					{/each}
				</select>
				<button class="btn btn-sm btn-primary px-3" on:click={addSlider}> <span class="fw-bold">+</span> </button>
				<button class="btn btn-sm btn-outline-danger px-3" on:click={deleteSlider}> <span class="fw-bold">×</span> </button>
			</div>
			<div class="container col-sm-10 col-md-8 mx-auto">
				<label for="sliderName" class="form-label">Nazwa</label>
				<input type="text" class="form-control" id="sliderName" bind:value={name} />

				<label for="sliderInterval" class="form-label mt-3">Czas zmiany (ms)</label>
				<input type="number" class="form-control" id="sliderInterval" bind:value={interval} />

				<button on:click={saveSlider} class="btn btn-primary mt-4"> Zapisz </button>
			</div>

			{#if id != 0}
				<div class="container col-12 my-4">
					<span class="form-label">Slajdy</span>
					<table class="table table-striped">
						<thead>
							<tr>
								<th scope="column"> ID </th>
								<th scope="column"> Obraz </th>
								<th scope="column"> Tytuł </th>
								<th scope="column"> Podtytuł </th>
								<th scope="column" />
							</tr>
						</thead>
						<tbody>
							{#each slides as slide}
								<tr>
									<th scope="col" class="pt-3">
										{slide[0]}
									</th>

									<td class="pt-3">
										{#if slide[0] == currentlyEdited}
											<select class="form-control form-select-sm" bind:value={editedImagePath}>
												{#each sliderImages as image}
													<option value={image}>
														{image}
													</option>
												{/each}
											</select>
										{:else}
											{slide[2]}
										{/if}
									</td>

									<td class="pt-3">
										{#if slide[0] == currentlyEdited}
											<input bind:value={editedTitle} type="text" class="form-control form-control-sm" />
										{:else}
											{slide[4]}
										{/if}
									</td>

									<td class="pt-3">
										{#if slide[0] == currentlyEdited}
											<input bind:value={editedSubtitle} type="text" class="form-control form-control-sm" />
										{:else}
											{slide[5]}
										{/if}
									</td>

									<td>
										{#if slide[0] == currentlyEdited}
											<button on:click={saveSlide} class="btn btn-sm btn-outline-primary my-1">Zapisz</button>
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
													currentlyEdited = slide[0];
													editedImagePath = slide[2];
													editedTitle = slide[4];
													editedSubtitle = slide[5];
												}}
												class="btn btn-sm btn-primary my-1">Edytuj</button
											>
											<button on:click={() => deleteSlide(slide[0])} class="btn btn-sm btn-outline-danger ms-3 my-1"
												>Usuń</button
											>
										{/if}
									</td>
								</tr>
							{/each}

							<tr>
								<th scope="row" class="pt-3"> Nowy </th>
								<td class="pt-3">
									<select class="form-control form-select-sm" bind:value={newImagePath}>
										{#each sliderImages as image}
											<option value={image}>
												{image}
											</option>
										{/each}
									</select>
								</td>
								<td class="pt-3">
									<input type="text" class="form-control form-control-sm" bind:value={newTitle} />
								</td>
								<td class="pt-3">
									<input type="text" class="form-control form-control-sm" bind:value={newSubtitle} />
								</td>
								<td>
									<button on:click={addSlide} class="btn btn-sm btn-success my-2">Dodaj</button>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			{/if}
		</div>
		<div class="tab-pane container" id="sliders-images">
			<p class="h1 mb-3">Upload</p>

			<div class="container col-6">
				<input name="file" type="file" bind:files={uploadFiles} multiple accept="image/*" class="form-control mt-4" />
				<button on:click={uploadSliderImages} type="button" class="btn btn-success mt-3">Wgraj</button>
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
						{#each sliderImages as image}
							<tr>
								<td class="text-center fw-bold">{image}</td>
								<td class="text-start lh-1">
									<img class="img-preview" src={`/uploads/slider/${image}`} alt={image} />
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>

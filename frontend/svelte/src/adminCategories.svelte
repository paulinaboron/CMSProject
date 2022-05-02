<script>
	let getAllCategories = async () => {
		let response = await fetch("http://localhost:5000/adminGetAllCategories", { method: "POST" });
		let responseJSON = await response.json();
		return await responseJSON;
	};

	let categoriesData = [];
	let name = "";
	let editedName = "";
	let currentlyEdited = 0;

	const getData = () => {
		getAllCategories().then((data) => {
			categoriesData = data;
		});
	};

	const addCategory = () => {
		fetch("http://localhost:5000/adminAddCategory", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name
			})
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.state == "valid") {
					getData();
				}
			});
	};

	const saveCategory = () => {
		fetch("http://localhost:5000/adminSaveCategory", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				id: currentlyEdited,
				newName: editedName
			})
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.state == "valid") {
					getData();
					currentlyEdited = 0;
					editedName = "";
				}
			});
	};

	const deleteRecord = (id) => {
		fetch("http://localhost:5000/adminDeleteCategory", {
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

	getData();
</script>

<div class="tab-pane active container" id="categories">
	<p class="h1 mb-3">Categories</p>
	<div class="container col-8">
		<table class="table table-striped">
			<thead>
				<tr>
					<th scope="column"> ID </th>
					<th scope="column"> Nazwa </th>
					<th scope="column" />
				</tr>
			</thead>
			<tbody>
				{#each categoriesData as category}
					<tr>
						<th scope="col" class="pt-3">
							{category[0]}
						</th>
						<td class="pt-3">
							{#if category[0] == currentlyEdited}
								<input bind:value={editedName} type="text" class="form-control form-control-sm" />
							{:else}
								{category[1]}
							{/if}
						</td>
						<td>
							{#if category[0] == currentlyEdited}
								<button on:click={saveCategory} class="btn btn-sm btn-outline-primary my-1">Zapisz</button>
								<button
									on:click={() => {
										currentlyEdited = 0;
										editedName = "";
									}}
									class="btn btn-sm btn-outline-danger ms-3 my-1">Anuluj</button
								>
							{:else}
								<button
									on:click={() => {
										currentlyEdited = category[0];
										editedName = category[1];
									}}
									class="btn btn-sm btn-primary my-1">Edytuj</button
								>
								<button on:click={() => deleteRecord(category[0])} class="btn btn-sm btn-outline-danger ms-3 my-1"
									>Usuń</button
								>
							{/if}
						</td>
					</tr>
				{/each}
				<tr>
					<th scope="row" class="pt-3"> Nowa </th>
					<td class="pt-3">
						<input type="text" class="form-control form-control-sm" bind:value={name} />
					</td>
					<td>
						<button on:click={addCategory} class="btn btn-sm btn-success my-2">Dodaj</button>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
	<!--<div class="container d-flex justify-content-start gap-2 align-items-center mb-3 col-sm-10 col-md-8 mx-auto">
		<button class="btn btn-sm btn-primary px-3" on:click={addNew}> <span class="fw-bold">+</span> </button>
		<button class="btn btn-sm btn-outline-danger px-3" on:click={deleteRecord}> <span class="fw-bold">×</span> </button>
	</div>
	<div class="container col-sm-10 col-md-8 mx-auto">
		<label for="articleTitle" class="form-label">Tytuł</label>
		<input type="text" class="form-control" id="articleTitle" bind:value={title} />

		<label for="articleSubtitle" class="form-label mt-2">Podtytuł</label>
		<input type="text" class="form-control" id="articleSubtitle" bind:value={subtitle} />

		<label for="articleContent" class="form-label mt-2">Treść (&lt;tab&gt; - wcięcie, &lt;nl&gt; - przejście do nowej linii)</label>
		<textarea type="text" class="form-control" id="articleContent" bind:value={content} />

		<label for="articleConnnectedGallery" class="form-label mt-2">Powiązana galeria</label>
		<br />
		<select id="articleConnnectedGallery" class="form-control form-select col-5" bind:value={connectedGallery}>
			<option value={0}> *BRAK* </option>
			{#each galleries as gallery}
				<option value={gallery[0]}>
					{gallery[0]} - {gallery[1]}
				</option>
			{/each}
		</select>

		<label for="articleCategoryID" class="form-label mt-2">Kategoria</label>
		<br />
		<select id="articleCategoryID" class="form-control form-select col-5" bind:value={categoryID}>
			<option value={0}> *BRAK* </option>
			{#each categories as category}
				<option value={category[0]}>
					{category[0]} - {category[1]}
				</option>
			{/each}
		</select>

		<button on:click={saveRecord} class="btn btn-primary mt-4"> Zapisz </button>
	</div>-->
</div>

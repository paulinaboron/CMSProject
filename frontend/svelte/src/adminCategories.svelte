<script>
	export let admArticles;
	export let admLinks;

	let getAllCategories = async () => {
		let response = await fetch("/adminGetAllCategories", { method: "POST" });
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
		fetch("/adminAddCategory", {
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
					admArticles.init();
					admLinks.init();
				}
			});
	};

	const saveCategory = () => {
		fetch("/adminSaveCategory", {
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
					admArticles.init();
					admLinks.init();
				}
			});
	};

	const deleteRecord = (id) => {
		fetch("/adminDeleteCategory", {
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
					admArticles.init();
					admLinks.init();
				}
			});
	};

	getData();
</script>

<div class="tab-pane container" id="categories">
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
</div>

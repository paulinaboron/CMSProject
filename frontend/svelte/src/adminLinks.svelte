<svelte:options accessors={true} />

<script>
	let comp = "header";
	let linksData = [];
	let articlesData = [];
	let categoriesData = [];
	let editedName = "";
	let editedDbID = 0;
	let editedText = "";
	let newName = "/";
	let newDbID = 1;
	let newText = "";
	let currentlyEdited = 0;

	const getLinksData = async () => {
		await fetch("http://localhost:5000/adminGetNavLinks", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				component: comp
			})
		})
			.then((response) => response.json())
			.then((data) => {
				linksData = data.map((elem) => {
					let id = elem[0];
					let name = elem[1].indexOf("?") == -1 ? elem[1] : elem[1].substring(0, elem[1].indexOf("?"));
					let dbId = elem[1].indexOf("=") == -1 ? "" : elem[1].substring(elem[1].indexOf("=") + 1);
					if (dbId != "") {
						dbId = parseInt(dbId);
					}
					let text = elem[2];
					return [id, name, dbId, text];
				});
			});
	};

	const getArticlesData = async () => {
		fetch("http://localhost:5000/adminGetAllArticles", { method: "POST" })
			.then((response) => response.json())
			.then((data) => {
				articlesData = data;
			});
	};

	const getCategoriesData = async () => {
		fetch("http://localhost:5000/adminGetAllCategories", { method: "POST" })
			.then((response) => response.json())
			.then((data) => {
				categoriesData = data;
			});
	};

	const addLink = () => {
		let link = "";
		if (newName == "/" || newName == "/allArticles") {
			link = newName;
		} else {
			link = `${newName}?id=${newDbID}`;
		}

		fetch("http://localhost:5000/adminAddNavLink", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				link: link,
				text: newText,
				component: comp
			})
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.state == "valid") {
					getLinksData();
					newName = "/";
					newDbID = 1;
					newText = "";
				}
			});
	};

	const saveLink = () => {
		let link = "";
		if (editedName == "/" || editedName == "/allArticles") {
			link = editedName;
		} else {
			link = `${editedName}?id=${editedDbID}`;
		}

		fetch("http://localhost:5000/adminSaveNavLink", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				id: currentlyEdited,
				link: link,
				text: editedText,
				component: comp
			})
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.state == "valid") {
					getLinksData();
					currentlyEdited = 0;
					editedName = "";
					editedDbID = 0;
					editedText = "";
				}
			});
	};

	const deleteLink = (id) => {
		fetch("http://localhost:5000/adminDeleteNavLink", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				id
			})
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.state == "valid") {
					getLinksData();
				}
			});
	};

	export const init = () => {
		getLinksData();
		getArticlesData();
		getCategoriesData();
		linksData = [];
		articlesData = [];
		categoriesData = [];
		editedName = "";
		editedDbID = 0;
		editedText = "";
		newName = "/";
		newDbID = 1;
		newText = "";
		currentlyEdited = 0;
	};

	init();
</script>

<div class="tab-pane" id="links">
	<nav class="nav nav-pills justify-content-start flex-column flex-md-row mb-3 mx-3">
		<button
			on:click={() => {
				comp = "header";
				init();
			}}
			class="nav-link active"
			data-bs-toggle="tab">Navigation</button
		>
		<button
			on:click={() => {
				comp = "footer";
				init();
			}}
			class="nav-link"
			data-bs-toggle="tab">Footer</button
		>
	</nav>
	<div class="tab-pane container active" id="links-nav">
		<p class="h1 mb-3">{comp == "header" ? `Navigation` : `Footer`}</p>
		<div class="container col-10">
			<table class="table table-striped">
				<thead>
					<tr>
						<th scope="column"> ID </th>
						<th scope="column" colspan="2"> URL </th>
						<th scope="column"> Tekst </th>
						<th scope="column" />
					</tr>
				</thead>
				<tbody>
					{#each linksData as link}
						<tr>
							<th scope="col" class="pt-3">
								{link[0]}
							</th>

							<td class="pt-3">
								{#if link[0] == currentlyEdited}
									<!-- svelte-ignore a11y-no-onchange -->
									<select
										on:change={() => {
											editedDbID = 1;
										}}
										class="form-select-sm form-control"
										bind:value={editedName}
									>
										<option value="/">Strona główna</option>
										<option value="/allArticles">Strona artykułów</option>
										<option value="/article">Artykuł</option>
										<option value="/category">Kategoria</option>
									</select>
								{:else if link[1] == "/"}
									Strona główna
								{:else if link[1] == "/allArticles"}
									Strona artykułów
								{:else if link[1] == "/article"}
									Artykuł
								{:else if link[1] == "/category"}
									Kategoria
								{/if}
							</td>

							<td class="pt-3">
								{#if link[0] == currentlyEdited}
									{#if editedName == "/article"}
										<select class="form-select-sm form-control" bind:value={editedDbID}>
											{#each articlesData as article}
												<option value={article[0]}>
													{article[0]} - {article[1]}
												</option>
											{/each}
										</select>
									{:else if editedName == "/category"}
										<select class="form-select-sm form-control" bind:value={editedDbID}>
											{#each categoriesData as category}
												<option value={category[0]}>
													{category[0]} - {category[1]}
												</option>
											{/each}
										</select>
									{/if}
								{:else if link[1] == "/article"}
									{#if articlesData.length != 0}
										{[
											...articlesData.filter((elem) => {
												return elem[0] == parseInt(link[2]);
											})
										][0][0]} - {[
											...articlesData.filter((elem) => {
												return elem[0] == parseInt(link[2]);
											})
										][0][1]}
									{/if}
								{:else if link[1] == "/category"}
									{#if categoriesData.length != 0}
										{[
											...categoriesData.filter((elem) => {
												return elem[0] == parseInt(link[2]);
											})
										][0][0]} - {[
											...categoriesData.filter((elem) => {
												return elem[0] == parseInt(link[2]);
											})
										][0][1]}
									{/if}
								{/if}
							</td>

							<td class="pt-3">
								{#if link[0] == currentlyEdited}
									<input bind:value={editedText} type="text" class="form-control form-control-sm" />
								{:else}
									{link[3]}
								{/if}
							</td>

							<td>
								{#if link[0] == currentlyEdited}
									<button on:click={saveLink} class="btn btn-sm btn-outline-primary my-1">Zapisz</button>
									<button
										on:click={() => {
											currentlyEdited = 0;
											editedName = "";
											editedDbID = 0;
											editedText = "";
										}}
										class="btn btn-sm btn-outline-danger ms-3 my-1">Anuluj</button
									>
								{:else}
									<button
										on:click={() => {
											currentlyEdited = link[0];
											editedName = link[1];
											editedDbID = link[2];
											editedText = link[3];
										}}
										class="btn btn-sm btn-primary my-1">Edytuj</button
									>
									<button on:click={() => deleteLink(link[0])} class="btn btn-sm btn-outline-danger ms-3 my-1"
										>Usuń</button
									>
								{/if}
							</td>
						</tr>
					{/each}
					<tr>
						<th scope="col" class="pt-3"> Nowy </th>

						<td class="pt-3">
							<!-- svelte-ignore a11y-no-onchange -->
							<select
								on:change={() => {
									newDbID = 1;
								}}
								class="form-select-sm form-control"
								bind:value={newName}
							>
								<option value="/">Strona główna</option>
								<option value="/allArticles">Strona artykułów</option>
								<option value="/article">Artykuł</option>
								<option value="/category">Kategoria</option>
							</select>
						</td>

						<td class="pt-3">
							{#if newName == "/article"}
								<select class="form-select-sm form-control" bind:value={newDbID}>
									{#each articlesData as article}
										<option value={article[0]}>
											{article[0]} - {article[1]}
										</option>
									{/each}
								</select>
							{:else if newName == "/category"}
								<select class="form-select-sm form-control" bind:value={newDbID}>
									{#each categoriesData as category}
										<option value={category[0]}>
											{category[0]} - {category[1]}
										</option>
									{/each}
								</select>
							{/if}
						</td>
						<td>
							<input type="text" class="form-control form-control-sm mt-2" bind:value={newText} />
						</td>
						<td>
							<button on:click={addLink} class="btn btn-sm btn-success my-2">Dodaj</button>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</div>

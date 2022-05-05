<svelte:options accessors={true} />

<script>
	export let admLinks;

	let getAllArticles = async () => {
		let response = await fetch("http://localhost:5000/adminGetAllArticles", { method: "POST" });
		let responseJSON = await response.json();
		return await responseJSON;
	};

	let currentID = 0;
	let articlesData = [];
	let categories = [];
	let galleries = [];
	let title = "";
	let subtitle = "";
	let content = "";
	let connectedGallery = 0;
	let categoryID = 0;

	const getData = () => {
		getAllArticles().then((data) => {
			articlesData = data;
			changeData();
		});
	};

	const getCategories = () => {
		fetch("http://localhost:5000/adminGetAllCategories", { method: "POST" })
			.then((response) => response.json())
			.then((data) => {
				categories = data;
			});
	};

	const getGalleries = () => {
		fetch("http://localhost:5000/adminGetAllGalleries", { method: "POST" })
			.then((response) => response.json())
			.then((data) => {
				galleries = data;
			});
	};

	const changeData = () => {
		if (articlesData.length > 0) {
			title = articlesData[currentID][1];
			subtitle = articlesData[currentID][2];
			content = articlesData[currentID][3].replace("&nbsp;&nbsp;&nbsp;", "<tab>").replace("</br>", "\n<nl>");
			connectedGallery = articlesData[currentID][6];
			categoryID = articlesData[currentID][7];
		} else {
			[title, subtitle, content, connectedGallery, categoryID] = ["", "", "", 0, 0];
		}
	};

	const addNew = () => {
		articlesData = [...articlesData, [0, "", "", "", "", "", 0, 0]];
		currentID = articlesData.length - 1;
		changeData();
		admLinks.init();
	};

	const saveRecord = () => {
		if (articlesData.length == 0) return;

		fetch("http://localhost:5000/adminSaveArticle", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				id: articlesData[currentID][0],
				title,
				subtitle,
				content: content.replace("<tab>", "&nbsp;&nbsp;&nbsp;").replace("\n<nl>", "</br>"),
				connectedGallery,
				categoryID
			})
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.state == "valid") {
					getData();
					admLinks.init();
				}
			});
	};

	const deleteRecord = () => {
		if (articlesData.length == 0) return;
		if (articlesData[currentID][0] == 0) {
			articlesData = articlesData.filter((elem, idx) => {
				return idx != currentID;
			});
			currentID = articlesData.length - 1;
			changeData();
		} else {
			fetch("http://localhost:5000/adminDeleteArticle", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					id: articlesData[currentID][0]
				})
			})
				.then((response) => response.json())
				.then((data) => {
					if (data.state == "valid") {
						getData();
						currentID = articlesData.length - 2;
						admLinks.init();
					}
				});
		}
	};

	export const init = () => {
		getData();
		getCategories();
		getGalleries();
	};

	init();
</script>

<div class="tab-pane container" id="articles">
	<p class="h1 mb-3">Articles</p>

	<div class="container d-flex justify-content-start gap-2 align-items-center mb-3 col-sm-10 col-md-8 mx-auto">
		<!-- svelte-ignore a11y-no-onchange -->
		<select class="form-select-sm col-8" bind:value={currentID} on:change={changeData}>
			{#each articlesData as article, idx}
				<option value={idx}>
					{article[0] == 0 ? "*NOWY*" : `${article[0]} - ${article[1]}`}
				</option>
			{/each}
		</select>
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
	</div>
</div>

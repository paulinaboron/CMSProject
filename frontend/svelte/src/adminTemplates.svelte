<svelte:options accessors={true} />

<script>
	const hexToRGB = (hexString = "#000000") => {
		let r = parseInt(hexString.substring(1, 3), 16);
		let g = parseInt(hexString.substring(3, 5), 16);
		let b = parseInt(hexString.substring(5, 7), 16);
		return `rgb(${r}, ${g}, ${b})`;
	};

	const RGBtoHex = (rgbString = "rgb(11,255,92)") => {
		rgbString = rgbString.replaceAll(" ", "");
		let r = parseInt(rgbString.substring(rgbString.indexOf("(") + 1, rgbString.indexOf(",")));
		let g = parseInt(rgbString.substring(rgbString.indexOf(",") + 1, rgbString.lastIndexOf(",")));
		let b = parseInt(rgbString.substring(rgbString.lastIndexOf(",") + 1, rgbString.indexOf(")")));

		let cStrings = [r.toString(16), g.toString(16), b.toString(16)];

		let leadingZeros = cStrings.map((cString) => {
			let fString = cString.length == 1 ? "0" + cString : cString;
			return fString;
		});

		return `#${leadingZeros[0]}${leadingZeros[1]}${leadingZeros[2]}`;
	};

	let templatesData = [];
	let componentsData = [];
	let currentID = 0;
	let id = 0;
	let name = "";
	let bgColor = "#ffffff";
	let fontColor = "#000000";
	let buttonColor = "#777777";
	let footerText = "";
	let navStyle = "classic";
	let fontFamily = "Segoe UI";
	let components = [];
	let newComponent = 1;
	let newComponentName = "";
	let editedComponent = 0;
	let editedComponentName = "";
	let currentlyEdited = 0;

	export const getData = () => {
		fetch("/adminGetAllTemplates", { method: "POST" })
			.then((response) => response.json())
			.then((data) => {
				templatesData = data;
				changeData();
			});

		fetch("/adminGetAllComponents", { method: "POST" })
			.then((response) => response.json())
			.then((data) => {
				componentsData = data;
			});
	};

	const addTemplate = () => {
		templatesData = [
			...templatesData,
			[0, "", "rgb(255,255,255)", "rgb(0,0,0)", "rgb(0,0,0)", "rgb(119,119,119)", "", "classic", "Segoe UI", []]
		];
		currentID = templatesData.length - 1;
		changeData();
	};

	const saveTemplate = () => {
		if (templatesData.length == 0) return;
		fetch("/adminSaveTemplate", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				id: templatesData[currentID][0],
				name,
				bgColor: hexToRGB(bgColor),
				fontColor: hexToRGB(fontColor),
				buttonColor: hexToRGB(buttonColor),
				footerText,
				navStyle,
				fontFamily
			})
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.state == "valid") {
					getData();
				}
			});
	};

	const deleteTemplate = () => {
		if (templatesData.length == 0) return;
		if (templatesData[currentID][0] == 1) {
			alert("Nie można usunąć domyślnego układu!");
			return;
		}

		if (!confirm("Czy na pewno usunąć układ?")) return;

		if (templatesData[currentID][0] == 0) {
			templatesData = templatesData.filter((elem, idx) => {
				return idx != currentID;
			});
			currentID = templatesData.length - 1;
			changeData();
		} else {
			fetch("/adminDeleteTemplate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					id: templatesData[currentID][0]
				})
			})
				.then((response) => response.json())
				.then((data) => {
					if (data.state == "valid") {
						currentID = templatesData.length - 2;
						getData();
					}
				});
		}
	};

	const addComponent = () => {
		fetch("/adminAddComponent", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				templateID: templatesData[currentID][0],
				componentID: newComponent,
				name: newComponentName
			})
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.state == "valid") {
					getData();
					newComponent = 1;
					newComponentName = "";
				}
			});
	};

	const saveComponent = () => {
		fetch("/adminSaveComponent", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				id: currentlyEdited,
				templateID: templatesData[currentID][0],
				componentID: editedComponent,
				name: editedComponentName
			})
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.state == "valid") {
					getData();
					currentlyEdited = 0;
					editedComponent = 1;
					editedComponentName = "";
				}
			});
	};

	const deleteComponent = (id, order) => {
		fetch("/adminDeleteComponent", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				id,
				order,
				templateID: templatesData[currentID][0]
			})
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.state == "valid") {
					getData();
				}
			});
	};

	const orderUp = (id, order) => {
		fetch("/adminComponentOrderUp", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				id,
				order,
				templateID: templatesData[currentID][0]
			})
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.state == "valid") {
					getData();
				}
			});
	};

	const orderDown = (id, order) => {
		fetch("/adminComponentOrderDown", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				id,
				order,
				templateID: templatesData[currentID][0]
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
		if (templatesData.length > 0) {
			id = templatesData[currentID][0];
			name = templatesData[currentID][1];
			bgColor = RGBtoHex(templatesData[currentID][2]);
			fontColor = RGBtoHex(templatesData[currentID][3]);
			buttonColor = RGBtoHex(templatesData[currentID][5]);
			footerText = templatesData[currentID][6];
			navStyle = templatesData[currentID][7];
			fontFamily = templatesData[currentID][8];
			components = templatesData[currentID][9];
		} else {
			[id, name, bgColor, fontColor, buttonColor, footerText, navStyle, fontFamily, components] = [
				"",
				"",
				"#ffffff",
				"#000000",
				"#777777",
				"",
				"classic",
				"Segoe UI",
				[]
			];
		}
	};

	getData();
</script>

<div class="tab-pane container active" id="templates">
	<p class="h1 mb-3">Templates</p>
	<div class="container d-flex justify-content-start gap-2 align-items-center mb-3 col-sm-10 col-md-8 mx-auto">
		<!--svelte-ignore a11y-no-onchange-->
		<select class="form-select-sm col-4" bind:value={currentID} on:change={changeData}>
			{#each templatesData as template, idx}
				<option value={idx}>
					{template[0] == 0 ? "*NOWY*" : `${template[0]} - ${template[1]}`}
				</option>
			{/each}
		</select>
		<button class="btn btn-sm btn-primary px-3" on:click={addTemplate}> <span class="fw-bold">+</span> </button>
		<button class="btn btn-sm btn-outline-danger px-3" on:click={deleteTemplate}> <span class="fw-bold">×</span> </button>
	</div>
	<div class="container col-sm-10 col-md-8 mx-auto">
		<label for="templateName" class="form-label">Nazwa</label>
		<input type="text" class="form-control" id="templateName" bind:value={name} />

		<label for="templatebgColor" class="form-label mt-3">Kolor tła</label>
		<input type="color" class="form-control" id="templatebgColor" bind:value={bgColor} />

		<label for="templateFontColor" class="form-label mt-3">Kolor tekstu</label>
		<input type="color" class="form-control" id="templateFontColor" bind:value={fontColor} />

		<label for="templateButtonColor" class="form-label mt-3">Kolor przycisku</label>
		<input type="color" class="form-control" id="templateButtonColor" bind:value={buttonColor} />

		<label for="templateFooterText" class="form-label mt-3">Tekst w stopce</label>
		<input type="text" class="form-control" id="templateFooterText" bind:value={footerText} />

		<label for="templateFooterText" class="form-label mt-3">Nawigacja</label>
		<select bind:value={navStyle} class="form-control form-select">
			<option value="classic"> Klasyczna </option>
			<option value="alternative"> Alternatywna </option>
		</select>

		<label for="templateFooterText" class="form-label mt-3">Czcionka strony</label>
		<select bind:value={fontFamily} class="form-control form-select">
			<option value="Segoe UI"> Segoe UI </option>
			<option value="Tahoma"> Tahoma </option>
			<option value="Arial"> Arial </option>
			<option value="Trebuchet MS"> Trebuchet MS </option>
			<option value="Lucida Grande"> Lucida Grande </option>
		</select>

		<button on:click={saveTemplate} class="btn btn-primary mt-4"> Zapisz </button>
	</div>

	{#if id != 0}
		<div class="container col-12 my-4">
			<span class="form-label">Sekcje</span>
			<table class="table table-striped">
				<thead>
					<tr>
						<th scope="column"> Kolejność </th>
						<th scope="column"> ID </th>
						<th scope="column"> Komponent </th>
						<th scope="column"> Nazwa </th>
						<th scope="column" />
					</tr>
				</thead>
				<tbody>
					{#each components as component}
						<tr>
							<th scope="col" class="pt-3">
								{component[3]}
								{#if component[3] == 1}
									<button
										on:click={() => orderDown(component[6], component[3])}
										class="btn btn-sm btn-primary px-1 py-0 m-left"
									>
										▼
									</button>
								{:else if component[3] == components.length}
									<button
										on:click={() => orderUp(component[6], component[3])}
										class="btn btn-sm btn-primary px-1 py-0 ms-2"
									>
										▲
									</button>
								{:else}
									<button
										on:click={() => orderUp(component[6], component[3])}
										class="btn btn-sm btn-primary px-1 py-0 ms-2"
									>
										▲
									</button>
									<button on:click={() => orderDown(component[6], component[3])} class="btn btn-sm btn-primary px-1 py-0">
										▼
									</button>
								{/if}
							</th>

							<td class="pt-3">
								{component[6]}
							</td>

							<td class="pt-3">
								{#if component[6] == currentlyEdited}
									<select class="form-control form-select-sm" bind:value={editedComponent}>
										{#each componentsData as compData}
											<option value={compData[0]}>
												{compData[1]}{compData[2] == 0 ? `` : `, id: ${compData[2]}`} ({compData[3]})
											</option>
										{/each}
									</select>
								{:else}
									{component[1]}{component[2] == 0 ? `` : `, id: ${component[2]}`} ({component[5]})
								{/if}
							</td>

							<td class="pt-3">
								{#if component[6] == currentlyEdited}
									<input type="text" bind:value={editedComponentName} class="form-control form-control-sm" />
								{:else}
									{component[4]}
								{/if}
							</td>

							<td>
								{#if component[6] == currentlyEdited}
									<button on:click={saveComponent} class="btn btn-sm btn-outline-primary my-1">Zapisz</button>
									<button
										on:click={() => {
											currentlyEdited = 0;
										}}
										class="btn btn-sm btn-outline-danger ms-3 my-1">Anuluj</button
									>
								{:else}
									<button
										on:click={() => {
											currentlyEdited = component[6];
											editedComponent = component[0];
											editedComponentName = component[4];
										}}
										class="btn btn-sm btn-primary my-1">Edytuj</button
									>
									<button
										on:click={() => deleteComponent(component[6], component[3])}
										class="btn btn-sm btn-outline-danger ms-3 my-1">Usuń</button
									>
								{/if}
							</td>
						</tr>
					{/each}

					<tr>
						<th scope="row" class="pt-3">
							{#if components.length == 0}
								1
							{:else}
								{components[components.length - 1][3] + 1}
							{/if}
						</th>

						<td class="pt-3"> Nowy </td>

						<td class="pt-3">
							<select class="form-control form-select-sm" bind:value={newComponent}>
								{#each componentsData as compData}
									<option value={compData[0]}>
										{compData[1]}{compData[2] == 0 ? `` : `, id: ${compData[2]}`} ({compData[3]})
									</option>
								{/each}
							</select>
						</td>

						<td class="pt-3">
							<input type="text" bind:value={newComponentName} class="form-control form-control-sm" />
						</td>

						<td>
							<button on:click={addComponent} class="btn btn-sm btn-success my-2">Dodaj</button>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	{/if}
</div>

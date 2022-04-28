<script>
	const setRootStyle = (key, val) => {
		document.documentElement.style.setProperty(key, val);
	};

	const setColors = (darkMode) => {
		if (darkMode) {
			setRootStyle("--bg-color", "black");
			setRootStyle("--card-color", "rgb(48, 48, 48)");
			setRootStyle("--font-color", "white");
			setRootStyle("--icon-color", "white");
		} else {
			setRootStyle("--bg-color", "white");
			setRootStyle("--card-color", "white");
			setRootStyle("--font-color", "black");
			setRootStyle("--icon-color", "rgba(0, 0, 0, 0.5)");
		}
	};

	async function getDarkModeSettings() {
		let response = await fetch("/getDarkMode", { method: "POST" });
		let responseJSON = await response.json();
		let darkModeResp = responseJSON.darkMode;
		darkMode = darkModeResp;
		setColors(darkMode);
		return darkModeResp;
	}

	const switchDarkMode = () => {
		fetch("/switchDarkMode", { method: "POST" }).then((resp) => {
			darkMode = getDarkModeSettings();
		});
	};

	let darkMode = false;
	let darkModeFetch = getDarkModeSettings();
</script>

{#await darkModeFetch then darkModeFetch}
	<div class="form-check form-switch">
		<input
			class="form-check-input"
			type="checkbox"
			role="switch"
			id="flexSwitchCheckDefault"
			on:change={switchDarkMode}
			bind:checked={darkMode}
		/>
		<label class="form-check-label" for="flexSwitchCheckDefault"
			>Darkmode</label
		>
	</div>
{/await}

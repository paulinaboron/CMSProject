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
			setRootStyle("--button-color", "rgb(90, 90, 90)");
		} else {
			setRootStyle("--bg-color", colors.bg_color);
			setRootStyle("--card-color", colors.bg_color);
			setRootStyle("--font-color", colors.font_color);
			setRootStyle("--icon-color", colors.icon_color);
			setRootStyle("--button-color", colors.button_color);
		}
	};

	const getDarkModeSettings = async (callback) => {
		let response = await fetch("/getDarkMode", { method: "POST" });
		let responseJSON = await response.json();
		let darkModeResp = responseJSON.darkMode;
		darkMode = darkModeResp;
		callback()
		return darkModeResp;
	}

	const switchDarkMode = () => {
		fetch("/switchDarkMode", { method: "POST" }).then((resp) => {
			getDarkModeSettings(() => {return});
		});
	};

	const getTemplateColors = async () => {
		let response = await fetch("/getTemplateColors")
		let responseJSON = await response.json();
		return responseJSON
	}

	const init = async () => {
		colors = await getTemplateColors();
		setColors(darkMode);
	}

	
	let darkMode = false;
	let darkModeFetch = getDarkModeSettings(() => init());
	let colors = {}
	

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
		<label class="form-check-label darkmode-text" for="flexSwitchCheckDefault"
			>Dark</label
		>
	</div>
{/await}

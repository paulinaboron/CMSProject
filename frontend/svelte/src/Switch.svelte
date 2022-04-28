<script>
	const convertToHSL = (color = "rgb(24, 25, 26)") => {
		let colorsString = color.substring(4, color.length - 1);
		let rgbColors = colorsString.split(", ").map((elem) => {return parseInt(elem)});
		let rgbPrims = rgbColors.map((elem) => {return elem/255})

		console.log(rgbColors, rgbPrims)

		let CMax = Math.max(rgbPrims[0], rgbPrims[1], rgbPrims[2])
		let CMin = Math.min(rgbPrims[0], rgbPrims[1], rgbPrims[2])

		let delta = CMax - CMin

		console.log(CMax, CMin, delta)

		let hue;
		let sat;
		let light;

		switch (true) {
			case delta == 0:
				hue = 0
				break;
			case CMax == rgbPrims[0]:
				hue = 60 * (((rgbPrims[1] - rgbPrims[2]) / delta) % 6)
				break;

			case CMax == rgbPrims[1]:
				hue = 60 * (((rgbPrims[2] - rgbPrims[0]) / delta) + 2)
				break;

			case CMax == rgbPrims[2]:
				hue = 60 * (((rgbPrims[0] - rgbPrims[1]) / delta) + 4)
				break;
			default:
				break;
		}

		light = (CMax + CMin) / 2

		if(delta == 0){
			sat = 0
		}else{
			sat = delta / (1 - Math.abs((2 * light) - 1));
		}


		console.log("HSL", hue, sat * 100, light * 100)
	}

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

	const getDarkModeSettings = async () => {
		let response = await fetch("/getDarkMode", { method: "POST" });
		let responseJSON = await response.json();
		let darkModeResp = responseJSON.darkMode;
		darkMode = darkModeResp;
		setColors(darkMode);
		return darkModeResp;
	}

	const switchDarkMode = () => {
		fetch("/switchDarkMode", { method: "POST" }).then(() => {
			getDarkModeSettings();
		});
	};

	const getTemplateColors = async () => {
		let response = await fetch("/getTemplateColors")
		let responseJSON = await response.json();
		return responseJSON
	}

	const init = async () => {
		colors = await getTemplateColors();
		darkModeFetch = await getDarkModeSettings();
	};

	let darkMode = false;
	let darkModeFetch;
	let colors = {}

	init();
	convertToHSL();
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

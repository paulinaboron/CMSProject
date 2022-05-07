<script>
	const rgbStringToHsl = (color = "rgb(24, 25, 26)") => {
		let colorsString = color.substring(4, color.length - 1);
		let rgbColors = colorsString.split(", ").map((elem) => {
			return parseInt(elem);
		});
		let rgbPrims = rgbColors.map((elem) => {
			return elem / 255;
		});

		let CMax = Math.max(rgbPrims[0], rgbPrims[1], rgbPrims[2]);
		let CMin = Math.min(rgbPrims[0], rgbPrims[1], rgbPrims[2]);

		let delta = CMax - CMin;

		let hue;
		let sat;
		let light;

		switch (true) {
			case delta == 0:
				hue = 0;
				break;
			case CMax == rgbPrims[0]:
				hue = 60 * (((rgbPrims[1] - rgbPrims[2]) / delta) % 6);
				break;

			case CMax == rgbPrims[1]:
				hue = 60 * ((rgbPrims[2] - rgbPrims[0]) / delta + 2);
				break;

			case CMax == rgbPrims[2]:
				hue = 60 * ((rgbPrims[0] - rgbPrims[1]) / delta + 4);
				break;
			default:
				break;
		}

		light = (CMax + CMin) / 2;

		if (delta == 0) {
			sat = 0;
		} else {
			sat = delta / (1 - Math.abs(2 * light - 1));
		}

		return {
			hue: Math.round(hue),
			saturation: sat.toFixed(2) * 100,
			light: light.toFixed(2) * 100
		};
	};

	const forDark = (color) => {
		let { hue, saturation, light } = color;

		return {
			hue,
			saturation: Math.round(saturation * 0.92),
			light: Math.round(light * 0.85)
		};
	};

	const forBorder = (color) => {
		let { hue, saturation, light } = color;

		return {
			hue,
			saturation: Math.round(saturation + (100 - saturation) * 0.15),
			light: Math.round(light * 0.78)
		};
	};

	const forShadow = (color) => {
		let { hue, saturation, light } = color;

		return {
			hue,
			saturation,
			light: Math.round(light + (100 - light) * 0.15)
		};
	};

	const hslToHslString = (color) => {
		let { hue, saturation, light } = color;

		return `hsl(${hue}, ${saturation}%, ${light}%)`;
	};

	const hslToHslaString = (color, alpha) => {
		let { hue, saturation, light } = color;

		return `hsla(${hue}, ${saturation}%, ${light}%, ${alpha})`;
	};

	const setRootStyle = (key, val) => {
		document.documentElement.style.setProperty(key, val);
	};

	const darkColor = (color) => {
		return hslToHslString(forDark(rgbStringToHsl(color)));
	};

	const borderColor = (color) => {
		return hslToHslString(forBorder(rgbStringToHsl(color)));
	};

	const shadowColor = (color) => {
		return hslToHslaString(forShadow(rgbStringToHsl(color)), 0.5);
	};

	const setColors = (darkMode) => {
		if (darkMode) {
			setRootStyle("--bg-color", "var(--dark-bg-color)");
			setRootStyle("--card-color", "var(--dark-card-color)");
			setRootStyle("--font-color", "var(--dark-font-color)");
			setRootStyle("--icon-color", "var(--dark-icon-color)");
			setRootStyle("--button-color", "var(--dark-button-color)");
			setRootStyle("--button-color-dark", "var(--dark-button-color-dark)");
			setRootStyle("--button-border-color-dark", "var(--dark-button-border-color-dark)");
			setRootStyle("--button-shadow-color", "var(--dark-button-shadow-color)");
		} else {
			setRootStyle("--bg-color", colors.bg_color);
			setRootStyle("--card-color", colors.bg_color);
			setRootStyle("--font-color", colors.font_color);
			setRootStyle("--icon-color", colors.icon_color);
			setRootStyle("--button-color", colors.button_color);
			setRootStyle("--button-color-dark", darkColor(colors.button_color));
			setRootStyle("--button-border-color-dark", borderColor(colors.button_color));
			setRootStyle("--button-shadow-color", shadowColor(colors.button_color));
		}
	};

	const getDarkModeSettings = async () => {
		let response = await fetch("/getDarkMode", { method: "POST" });
		let responseJSON = await response.json();
		let darkModeResp = responseJSON.darkMode;
		darkMode = darkModeResp;
		setColors(darkMode);
		return darkModeResp;
	};

	const switchDarkMode = () => {
		fetch("/switchDarkMode", { method: "POST" }).then(() => {
			getDarkModeSettings();
		});
	};

	const getTemplateColors = async () => {
		let response = await fetch("/getTemplateColors");
		let responseJSON = await response.json();
		return responseJSON;
	};

	const getTemplateFont = async () => {
		let response = await fetch("/getTemplateFont");
		let responseJSON = await response.json();
		setRootStyle("--font", responseJSON.font);
	};

	const init = async () => {
		colors = await getTemplateColors();
		darkModeFetch = await getDarkModeSettings();
		getTemplateFont();
	};

	let darkMode = false;
	let darkModeFetch;
	let colors = {};

	init();
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
		<label class="form-check-label darkmode-text" for="flexSwitchCheckDefault">Dark</label>
	</div>
{/await}

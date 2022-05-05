<script>
	export let id;
	console.log("ID Slidera: ", id);

	async function getSliderData(id) {
		let response = await fetch(`/getSliderData?id=${id}`, {
			method: "post"
		});
		let responseJson = await response.json();
		console.log("responseJson: ", responseJson);
		return responseJson;
	}

	let sliderData = getSliderData(id);
	console.log("SliderData: ", sliderData);
</script>

{#await sliderData}
	<h1>Oczekiwanie na dane slidera</h1>
{:then sliderData}
	<div
		id={`carouselExampleDark${sliderData.id}`}
		class="carousel carousel-dark slide"
		data-bs-ride="carousel"
		data-bs-interval={sliderData.interval}
	>
		<div class="carousel-indicators">
			{#each sliderData.slides as slide, idx}
				{#if idx == 0}
					<button
						type="button"
						data-bs-target={`#carouselExampleDark${sliderData.id}`}
						data-bs-slide-to={idx}
						aria-label={"Slide " + idx}
						class="active"
						aria-current="true"
					/>
				{:else}
					<button
						type="button"
						data-bs-target={`#carouselExampleDark${sliderData.id}`}
						data-bs-slide-to={idx}
						aria-label={"Slide " + idx}
					/>
				{/if}
			{/each}
		</div>
		<div class="carousel-inner">
			{#each sliderData.slides as slide, idx}
				{#if idx == 0}
					<div class="carousel-item active">
						<img src={"/uploads/slider/" + slide.img_url} class="d-block slider-picture" alt="..." />
						<div class="carousel-caption d-none d-md-block">
							<h5>{slide.title}</h5>
							<p>{slide.subtitle}</p>
						</div>
					</div>
				{:else}
					<div class="carousel-item">
						<img src={"/uploads/slider/" + slide.img_url} class="d-block slider-picture" alt="..." />
						<div class="carousel-caption d-none d-md-block">
							<h5>{slide.title}</h5>
							<p>{slide.subtitle}</p>
						</div>
					</div>
				{/if}
			{/each}
		</div>
		<button class="carousel-control-prev" type="button" data-bs-target={`#carouselExampleDark${sliderData.id}`} data-bs-slide="prev">
			<span class="carousel-control-prev-icon" aria-hidden="true" />
			<span class="visually-hidden">Previous</span>
		</button>
		<button class="carousel-control-next" type="button" data-bs-target={`#carouselExampleDark${sliderData.id}`} data-bs-slide="next">
			<span class="carousel-control-next-icon" aria-hidden="true" />
			<span class="visually-hidden">Next</span>
		</button>
	</div>
{/await}

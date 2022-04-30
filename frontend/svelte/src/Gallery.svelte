<script>
	let params = new URLSearchParams(window.location.search);
	let id = params.get("id");
	console.log("Article ID: ", id);

	async function getGalleryData(id) {
		let response = await fetch(`/getGalleryData?id=${id}`, {
			method: "post"
		});
		let responseJson = await response.json();
		console.log("gallery", responseJson);
		return responseJson;
	}
	let galleryData = getGalleryData(id);

	$: {
		galleryData = getGalleryData(id);
	}
</script>

{#await galleryData then galleryData}
	{#if galleryData.error_message}
		<p>{galleryData.error_message}</p>
	{:else}
		<div
			id="carouselExampleControls"
			class="carousel carousel-dark slide"
			data-bs-ride="carousel"
		>
			<div class="carousel-inner">
				{#each galleryData.photos as photo, idx}
					{#if idx == 0}
						<div
							class="carousel-item active"
							data-bs-interval="9000"
						>
							<img
								class="d-block slider-picture"
								src="/uploads/galleries/{photo.img_url}"
								alt="Zdjęcie z galerii"
							/>
						</div>
					{:else}
						<div class="carousel-item" data-bs-interval="9000">
							<img
								class="d-block slider-picture"
								src="/uploads/galleries/{photo.img_url}"
								alt="Zdjęcie z galerii"
							/>
						</div>
					{/if}
				{/each}
			</div>

			<button
				class="carousel-control-prev"
				type="button"
				data-bs-target="#carouselExampleControls"
				data-bs-slide="prev"
			>
				<span class="carousel-control-prev-icon" aria-hidden="true" />
				<span class="visually-hidden">Previous</span>
			</button>
			<button
				class="carousel-control-next"
				type="button"
				data-bs-target="#carouselExampleControls"
				data-bs-slide="next"
			>
				<span class="carousel-control-next-icon" aria-hidden="true" />
				<span class="visually-hidden">Next</span>
			</button>
		</div>
	{/if}
{/await}

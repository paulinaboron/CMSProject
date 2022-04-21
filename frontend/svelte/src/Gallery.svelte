<script>
	let params = new URLSearchParams(window.location.search);
	let id = params.get("id");
	console.log("Article ID: ", id);

	async function getGalleryData(id) {
		let response = await fetch(`/getGalleryData?id=${id}`, { method: "post" });
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
		<div id="carouselExampleControls" class="carousel slide" data-ride="carousel">
			<div class="carousel-inner">
				<div class="carousel-item active">
					<img class="d-block slider-picture" src="/uploads/galleries/image1.jpg" alt="Zdjęcie z galerii" />
				</div>
				{#each galleryData.photos as photo}
					<div class="carousel-item">
						<img class="d-block slider-picture" src="/uploads/galleries/{photo.img_url}" alt="Zdjęcie z galerii" />
					</div>
				{/each}
			</div>
			<a class="carousel-control-prev" href="#carouselExampleControls" role="button" data-slide="prev">
				<span class="carousel-control-prev-icon" aria-hidden="true" />
				<span class="sr-only">Previous</span>
			</a>
			<a class="carousel-control-next" href="#carouselExampleControls" role="button" data-slide="next">
				<span class="carousel-control-next-icon" aria-hidden="true" />
				<span class="sr-only">Next</span>
			</a>
		</div>
	{/if}
{/await}

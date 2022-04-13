<script>
    let params = new URLSearchParams(window.location.search);
    let id = params.get("id");
    console.log("Article ID: ", id);

    async function getGalleryData(id) {
        let response = await fetch(
            `http://localhost:5000/getGalleryData?id=${id}`,
            { method: "post" }
        );
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
        {#each galleryData.photos as photo}
            <img src={photo.img_url} alt="Zdjęcie z galerii" />
            <p>{photo.description}</p>
        {/each}

        <div id="carouselExampleControls" class="carousel slide" data-ride="carousel">
            <div class="carousel-inner">
              <div class="carousel-item active">
                <img class="d-block w-100" src="..." alt="First slide">
              </div>
              <div class="carousel-item">
                <img class="d-block w-100" src="..." alt="Second slide">
              </div>
              <div class="carousel-item">
                <img class="d-block w-100" src="..." alt="Third slide">
              </div>
            </div>
            <a class="carousel-control-prev" href="#carouselExampleControls" role="button" data-slide="prev">
              <span class="carousel-control-prev-icon" aria-hidden="true"></span>
              <span class="sr-only">Previous</span>
            </a>
            <a class="carousel-control-next" href="#carouselExampleControls" role="button" data-slide="next">
              <span class="carousel-control-next-icon" aria-hidden="true"></span>
              <span class="sr-only">Next</span>
            </a>
          </div>



    {/if}
{/await}

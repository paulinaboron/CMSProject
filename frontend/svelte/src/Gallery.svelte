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
    {/if}
{/await}

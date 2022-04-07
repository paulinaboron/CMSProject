<script>
import Slider from "./Slider.svelte";

    export let id;
    console.log(id)

    async function getSliderData(id) {
		let response = await fetch(`http://localhost:5000/getSliderData?id=${id}`, { method: "post" });
		let responseJson = await response.json();
        console.log(responseJson)
		return responseJson;
	}
    
	let sliderData = getSliderData(id);
    console.log(sliderData)
</script>

<h2>Id slidera: {id}</h2>

{#await sliderData}
    <h1>Oczekiwanie na dane slidera</h1>
{:then sliderData} 
    <div
    id="carouselExampleDark"
    class="carousel carousel-dark slide"
    data-bs-ride="carousel"
    >
    <div class="carousel-indicators">
        {#each sliderData.slides as slide, idx}
            {#if slide.order == 1}
                <button
                    type="button"
                    data-bs-target="#carouselExampleDark"
                    data-bs-slide-to={idx}
                    aria-label={"Slide " + idx }
                    class="active"
                    aria-current="true"
                ></button>
            {:else}
                <button
                    type="button"
                    data-bs-target="#carouselExampleDark"
                    data-bs-slide-to={idx}
                    aria-label={"Slide " + idx }
                ></button>
            {/if}
        {/each}
    </div>
    <div class="carousel-inner">
        {#each sliderData.slides as slide, idx}
            {#if slide.order == 1}
                <div class="carousel-item active" data-bs-interval="9000">
                    <img
                    src={"/uploads/slider/" + slide.img_url}
                    class="d-block w-100 slider-picture"
                    alt="..."
                    />
                    <div class="carousel-caption d-none d-md-block">
                    <h5>{slide.title}</h5>
                    <p>{slide.subtitle}</p>
                    </div>
                </div>
            {:else}
                <div class="carousel-item" data-bs-interval="9000">
                    <img
                    src={"/uploads/slider/" + slide.img_url}
                    class="d-block w-100 slider-picture"
                    alt="..."
                    />
                    <div class="carousel-caption d-none d-md-block">
                    <h5>{slide.title}</h5>
                    <p>{slide.subtitle}</p>
                    </div>
                </div>
            {/if}
        {/each}
        
    </div>
        <button
        class="carousel-control-prev"
        type="button"
        data-bs-target="#carouselExampleDark"
        data-bs-slide="prev"
        >
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Previous</span>
        </button>
        <button
        class="carousel-control-next"
        type="button"
        data-bs-target="#carouselExampleDark"
        data-bs-slide="next"
        >
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Next</span>
        </button>
    </div>
{/await}
<!-- Slider -->


<script>
    export let id;
    console.log("ID Card: ", id);

    async function getArticleData(id) {
		let response = await fetch(`http://localhost:5000/getArticleData?id=${id}`, { method: "post" });
		let responseJson = await response.json();
        console.log("response: ", responseJson);
		return responseJson;
	}
	let cardData = getArticleData(id);

	$: {
		cardData = getArticleData(id);
	}
    console.log("CardData: ", cardData);
</script>

{#await cardData}
    <h1>Oczekiwanie na dane slidera</h1>
{:then cardData} 
<div class="card" style="width: 18rem">
    <div class="card-body">
        <h5 class="card-title">{cardData.content} {id}</h5>
        <p class="card-text">
            Some quick example text to build on the card title and make up the
            bulk of the card's content.
        </p>
        <a href="./article?id={id}" class="btn btn-secondary">Go somewhere</a>
    </div>
</div>
{/await}

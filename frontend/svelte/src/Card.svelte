<script>
    export let id;
    console.log("ID Card: ", id);

    async function getArticleData(id) {
		let response = await fetch(`/getArticleData?id=${id}`, { method: "post" });
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
    <h1>Oczekiwanie na dane atykułu</h1>
{:then cardData} 
<div class="card" style="width: 18rem">
    <div class="card-body">
        <h5 class="card-title">{cardData.title}</h5>
        <p class="card-text">
            {@html cardData.content}
        </p>
        <a href="./article?id={id}" class="btn btn-secondary">Go to article {id}</a>
    </div>
</div>
{/await}

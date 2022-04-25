<script>
	export let sticky = false;
	async function getLinks() {
		let response = await fetch(`/getLinks?component=footer`, { method: "post" });
		let responseJson = await response.json();
		console.log("response ff: ", responseJson);
		return responseJson;
	}

	let footerData = getLinks();

	$: {
		footerData = getLinks();
	}
	console.log("FooterData: ", footerData, footerData[0]);
</script>

{#await footerData}
	<h1>Oczekiwanie na dane stopki</h1>
{:then footerData}
<div class="content">
	<div class="container" class:fixed-bottom={sticky}>
		<footer class="pt-3 mt-4">
			<ul class="nav justify-content-center border-bottom pb-2 mb-2">
				{#each footerData as item}
					<li class="nav-item">
						<a href={item.url} class="nav-link px-2 text-muted">{item.text}</a>
					</li>
				{/each}
			</ul>
			<p class="text-center text-muted">© 2021 Company, Inc</p>
		</footer>
	</div>
</div>
	
{/await}

<script>
	import Navigation from "./Navigation.svelte";
	import Footer from "./Footer.svelte";

	let valueFirstCredential = "";
	let valuePassword = "";
	let alert = "";

	const initFetch = () => {
		fetch("/loginUser", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				firstCredential: valueFirstCredential,
				password: valuePassword,
			}),
		})
			.then(response => response.json())
			.then(data => {
				if (data.error_message) {
					alert = data.error_message;
				} else {
					console.log("działa");
					window.location.href = "/";
				}
			});
	};
</script>

<main>
	<Navigation />

	{#if alert != ""}
		<div class="container mt-5 mb-4">
			<div class="alert alert-warning col-sm-10 col-md-8 mx-auto" role="alert">
				{alert}
			</div>
		</div>
	{/if}

	<div class="container d-flex mt-3">
		<form class="col-sm-10 col-md-8 mx-auto" method="post" on:submit|preventDefault={() => initFetch()}>
			<div class="mb-3">
				<label for="input-first-credential" class="form-label">Email / login</label>
				<input
					type="text"
					class="form-control"
					id="input-first-credential"
					name="firstCredential"
					bind:value={valueFirstCredential}
				/>
			</div>
			<div class="mb-3">
				<label for="input-password" class="form-label">Hasło</label>
				<input type="password" class="form-control" id="input-password" name="password" bind:value={valuePassword} />
			</div>
			<button type="submit" class="btn btn-primary">Zaloguj</button>
		</form>
	</div>

	<Footer sticky={true} />
</main>

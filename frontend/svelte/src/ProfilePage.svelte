<script>
	import Navigation from "./Navigation.svelte";
	import Footer from "./Footer.svelte";

	let valueFirstCredential = "";
	let valuePassword = "";

	const initFetch = () => {
		console.log("zmiana danych profilu");
	};
</script>

<main>
	<Navigation />


	<div class="container d-flex mt-3">
		<form class="col-sm-10 col-md-8 mx-auto" method="post" on:submit|preventDefault={() => initFetch()}>
            <br/><h2>Twój profil</h2><br/>
			<div class="mb-3">
				<label for="input-first-credential" class="form-label">Zmień email</label>
				<input
					type="text"
					class="form-control"
					id="input-first-credential"
					name="firstCredential"
					bind:value={valueFirstCredential}
				/>
			</div>
			<div class="mb-3">
				<label for="input-password" class="form-label">Zmień hasło</label>
				<input type="password" class="form-control" id="input-password" name="password" bind:value={valuePassword} />
			</div>
			<button type="submit" class="btn btn-primary">Zapisz zmiany</button>
		</form>
	</div> -->

	<Footer sticky={true} />
</main>

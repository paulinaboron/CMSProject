<script>
    import Navigation from "./Navigation.svelte";
    import Footer from "./Footer.svelte"

</script>

<main>
    <Navigation />

    <div class="container d-flex mt-3">
        <form class="col-sm-10 col-md-8 mx-auto" method="post" on:submit={() => asd()}>
            <div class="mb-3">
                <label for="input-first-credential" class="form-label">Email / login</label>
                <input type="text" class="form-control" id="input-first-credential" name="firstCredential">
            </div>
            <div class="mb-3">
                <label for="input-password" class="form-label">Hasło</label>
                <input type="password" class="form-control" id="input-password" name="password">
            </div>
            <button type="submit" class="btn btn-primary">Zaloguj</button>
        </form>
    </div>

    <Footer />
</main>
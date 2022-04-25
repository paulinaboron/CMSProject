<script>
    let text = "";

    function search() {
        window.location.href = `/search?text=${text}`
    }
</script>

<form class="d-flex" on:submit|preventDefault={search}>
    <input
        class="form-control me-2"
        type="search"
        placeholder="Search"
        aria-label="Search"
        name="text"
    />
    <button class="btn btn-outline-success" type="submit">OK</button
    >
</form>
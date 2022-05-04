<script>
	import AdminFeaturettes from "./adminFeaturettes.svelte";
	import AdminArticles from "./adminArticles.svelte";
	import AdminCategories from "./adminCategories.svelte";
	import AdminGalleries from "./adminGalleries.svelte";

	let adminFeaturettes;
	let admArticles;
	let admCategories;
	let adminGalleries;
</script>

<div class="container mt-2">
	<div class="col-12">
		<nav class="nav nav-pills justify-content-start flex-column flex-md-row mb-3">
			<a href="#featurettes" class="nav-link" data-bs-toggle="tab">Featurettes</a>
			<a href="#articles" class="nav-link" data-bs-toggle="tab">Articles</a>
			<a href="#categories" class="nav-link" data-bs-toggle="tab">Categories</a>
			<a href="#galleries" class="nav-link active" data-bs-toggle="tab">Galleries</a>
		</nav>
	</div>
	<div class="col-12">
		<div class="tab-content">
			<AdminFeaturettes />
			<AdminArticles bind:this={admArticles} />
			<AdminCategories {admArticles} />
			<AdminGalleries {admArticles} />
		</div>
	</div>
</div>

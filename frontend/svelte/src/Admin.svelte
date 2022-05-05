<script>
	import AdminFeaturettes from "./adminFeaturettes.svelte";
	import AdminArticles from "./adminArticles.svelte";
	import AdminCategories from "./adminCategories.svelte";
	import AdminGalleries from "./adminGalleries.svelte";
	import AdminLinks from "./adminLinks.svelte";
	import AdminSliders from "./adminSliders.svelte";
	import AdminTemplates from "./adminTemplates.svelte";

	let adminFeaturettes;
	let admArticles;
	let admCategories;
	let adminGalleries;
	let admLinks;
	let admTemplates;
</script>

<div class="container mt-2">
	<div class="col-12">
		<nav class="nav nav-pills justify-content-start flex-column flex-md-row mb-3">
			<a href="#featurettes" class="nav-link" data-bs-toggle="tab">Featurettes</a>
			<a href="#articles" class="nav-link" data-bs-toggle="tab">Articles</a>
			<a href="#categories" class="nav-link" data-bs-toggle="tab">Categories</a>
			<a href="#galleries" class="nav-link" data-bs-toggle="tab">Galleries</a>
			<a href="#links" class="nav-link" data-bs-toggle="tab">Links</a>
			<a href="#sliders" class="nav-link" data-bs-toggle="tab">Sliders</a>
			<a href="#templates" class="nav-link active" data-bs-toggle="tab">Templates</a>
		</nav>
	</div>
	<div class="col-12">
		<div class="tab-content">
			<AdminFeaturettes />
			<AdminArticles bind:this={admArticles} {admLinks} />
			<AdminCategories {admArticles} {admLinks} />
			<AdminGalleries {admArticles} />
			<AdminLinks bind:this={admLinks} />
			<AdminSliders />
			<AdminTemplates />
		</div>
	</div>
</div>

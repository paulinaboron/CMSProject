<script>
	let params = new URLSearchParams(window.location.search);
	let id = params.get("id");
	console.log("Article ID: ", id);

	async function getComments(id) {
		let response = await fetch(`/getCommentsForArticle?id=${id}`, {
			method: "post",
		});
		let responseJson = await response.json();
		console.log("comments", responseJson);
		return responseJson;
	}
	let commentsData = getComments(id);

	$: {
		commentsData = getComments(id);
	}

	let commentText = "";

	const submitComment = () => {
		fetch("/submitComment", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				articleID: id,
				commentText,
			}),
		})
			.then(response => response.json())
			.then(data => {
				if (!data.error_message) {
					console.log("działa");
					commentsData = getComments(id);
					commentText = "";
				} else {
					window.location.href = "/login";
				}
			});
	};
</script>

<div class="col-lg-7 comments-box">
	<div class="card">
		<div class="card-body text-center">
			<h4 class="card-title">Komentarze</h4>
		</div>
		<div class="comment-widgets">
			{#await commentsData}
				<p>Ładowanie komentarzy</p>
			{:then commentsData}
				{#each commentsData as comment}
					<!-- Comment Row -->
					<div class="d-flex flex-row comment-row m-t-0">
						<div class="comment-text w-100">
							<h6 class="font-medium">{comment.author}</h6>
							<span class="m-b-15 d-block">{comment.content}</span>
							<div class="comment-footer">
								<span class="text-muted float-right">{comment.creation_date}</span>
							</div>
						</div>
					</div>
					<br />
				{/each}
			{/await}
		</div>

		<div class="card-body text-center">
			<h4 class="card-title">Dodaj komentarz</h4>
		</div>
		<form class="comment-form" on:submit|preventDefault={submitComment}>
			<fieldset>
				<div class="row">
					<div class="form-group col-xs-12">
						<textarea bind:value={commentText} class="form-control" id="message" placeholder="Your message" required="" />
					</div>
				</div>
			</fieldset>
			<div />
			<button type="submit" class="btn btn-sm btn-outline-primary">OK</button>
		</form>
	</div>
</div>

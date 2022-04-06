import Article from "./Article.svelte";

const app = new Article({
  target: document.body,
  props: {
    name: "Article",
  },
});

export default app;

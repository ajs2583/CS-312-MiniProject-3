const express = require("express");
const app = express();
const PORT = 3000;
const pool = require("./db");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

let posts = [];

// Home page – show all posts
app.get("/", (req, res) => {
	res.render("index", { posts });
});

// Show form to create new post
app.get("/new", (req, res) => {
	res.render("new");
});

// Handle new post submission
app.post("/new", (req, res) => {
	const { title, author, content } = req.body;
	const newPost = {
		id: Date.now().toString(),
		title,
		author,
		content,
		date: new Date().toLocaleString(),
	};
	posts.unshift(newPost);
	res.redirect("/");
});

// Show form to edit a post
app.get("/edit/:id", (req, res) => {
	const post = posts.find((p) => p.id === req.params.id);
	if (post) {
		res.render("edit", { post });
	} else {
		res.redirect("/");
	}
});

// Handle post edit
app.post("/edit/:id", (req, res) => {
	const { title, author, content } = req.body;
	const post = posts.find((p) => p.id === req.params.id);
	if (post) {
		post.title = title;
		post.author = author;
		post.content = content;
	}
	res.redirect("/");
});

// Handle delete
app.get("/delete/:id", (req, res) => {
	posts = posts.filter((p) => p.id !== req.params.id);
	res.redirect("/");
});

app.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`);
});

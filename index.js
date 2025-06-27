require("dotenv").config();
const express = require("express");
const session = require("express-session");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.use(
	session({
		secret: process.env.SESSION_SECRET || "secret",
		resave: false,
		saveUninitialized: false,
	})
);

app.use((req, res, next) => {
	res.locals.userId = req.session.userId;
	res.locals.name = req.session.name;
	next();
});

// Home page - show all posts
app.get("/", async (req, res) => {
	const { rows } = await pool.query(
		"SELECT blog_id, creator_name, creator_user_id, title, body, date_created FROM blogs ORDER BY date_created DESC"
	);
	res.render("index", { posts: rows });
});

// Registration form
app.get("/register", (req, res) => {
	res.render("register", { error: null });
});

// Handle registration
app.post("/register", async (req, res) => {
	const { user_id, password, name } = req.body;
	const existing = await pool.query("SELECT 1 FROM users WHERE user_id=$1", [
		user_id,
	]);
	if (existing.rowCount > 0) {
		return res.render("register", {
			error: "User ID already taken",
		});
	}
	await pool.query(
		"INSERT INTO users(user_id, password, name) VALUES ($1,$2,$3)",
		[user_id, password, name]
	);
	res.redirect("/login");
});

// Login form
app.get("/login", (req, res) => {
	res.render("login", { error: null });
});

// Handle login
app.post("/login", async (req, res) => {
	const { user_id, password } = req.body;
	const { rows } = await pool.query(
		"SELECT * FROM users WHERE user_id=$1 AND password=$2",
		[user_id, password]
	);
	if (rows.length === 0) {
		return res.render("login", {
			error: "Invalid credentials",
		});
	}
	req.session.userId = rows[0].user_id;
	req.session.name = rows[0].name;
	res.redirect("/");
});

// Logout
app.get("/logout", (req, res) => {
	req.session.destroy(() => {
		res.redirect("/");
	});
});

// Show form to create new post
app.get("/new", (req, res) => {
	if (!req.session.userId) return res.redirect("/login");
	res.render("new");
});

// Handle new post submission
app.post("/new", async (req, res) => {
	if (!req.session.userId) return res.redirect("/login");
	const { title, content } = req.body;
	await pool.query(
		"INSERT INTO blogs(creator_name, creator_user_id, title, body) VALUES ($1,$2,$3,$4)",
		[req.session.name, req.session.userId, title, content]
	);
	res.redirect("/");
});

// Show form to edit a post
app.get("/edit/:id", async (req, res) => {
	if (!req.session.userId) return res.redirect("/login");
	const { rows } = await pool.query("SELECT * FROM blogs WHERE blog_id=$1", [
		req.params.id,
	]);
	const post = rows[0];
	if (!post || post.creator_user_id !== req.session.userId) {
		return res.redirect("/");
	}
	res.render("edit", { post });
});

// Handle post edit
app.post("/edit/:id", async (req, res) => {
	if (!req.session.userId) return res.redirect("/login");
	const { title, content } = req.body;
	await pool.query(
		"UPDATE blogs SET title=$1, body=$2 WHERE blog_id=$3 AND creator_user_id=$4",
		[title, content, req.params.id, req.session.userId]
	);
	res.redirect("/");
});

// Handle delete
app.get("/delete/:id", async (req, res) => {
	if (!req.session.userId) return res.redirect("/login");
	await pool.query(
		"DELETE FROM blogs WHERE blog_id=$1 AND creator_user_id=$2",
		[req.params.id, req.session.userId]
	);
	res.redirect("/");
});

app.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`);
});

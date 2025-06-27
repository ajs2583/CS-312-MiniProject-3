CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(255) PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL
);
CREATE TABLE IF NOT EXISTS blogs (
    blog_id SERIAL PRIMARY KEY,
    creator_name VARCHAR(255) NOT NULL,
    creator_user_id VARCHAR(255) REFERENCES users(user_id),
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    date_created TIMESTAMP DEFAULT NOW()
);
INSERT INTO users (user_id, password, name)
VALUES ('alice', 'password1', 'Alice'),
    ('bob', 'password2', 'Bob'),
    ('charlie', 'password3', 'Charlie');
INSERT INTO blogs (
        creator_name,
        creator_user_id,
        title,
        body,
        date_created
    )
VALUES (
        'Alice',
        'alice',
        'Welcome to the Blog',
        'This is the first post.',
        NOW() - INTERVAL '5 day'
    ),
    (
        'Bob',
        'bob',
        'Second Thoughts',
        'Sharing some insights.',
        NOW() - INTERVAL '4 day'
    ),
    (
        'Charlie',
        'charlie',
        'Node Tips',
        'Let\'s learn Node.js together.',
        NOW() - INTERVAL '3 day'
    ),
    (
        'Alice',
        'alice',
        'Express Tricks',
        'Middleware magic explained.',
        NOW() - INTERVAL '2 day'
    ),
    (
        'Bob',
        'bob',
        'Databases 101',
        'Understanding SQL basics.',
        NOW() - INTERVAL '1 day'
    );
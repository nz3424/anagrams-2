import express from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import mysql from "mysql2/promise";

dotenv.config();

const app = express();
app.use(cors());
app.options('*', cors());
app.use(express.json());
const port = 3001;

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Generate JWT
function generateToken(user) {
    return jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user; // decoded token payload
        next();
    });
}
// run "npm start"


app.listen(port, () => {
    console.log("server running on port 3001");
})

app.post("/signup", async (req, res) => {
    try {
        const { username, password } = req.body;
        const id = uuidv4(); // random id generator
        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query("INSERT INTO users (id, username, password_hash) values (?, ?, ?)", [id, username, hashedPassword]);

        const token = generateToken({ id, username }); // create token from JWT

        res.json({ token, username, id }) // send info back to frontend
    }
    catch (error) {
        res.status(500).json({ error: "Signup did not work" })
    }
})

app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log("Login attempt for user: ", username);
        const [users] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
        if (users.length === 0) {
            return res.status(400).json({ error: "User not found" });
        }
        const user = users[0];
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        // if password matches, then we want to log in 
        if (passwordMatch) {
            const token = generateToken(user);
            res.status(200).json({ token, username, id: user.id });
        }
        else {
            res.status(400).json({ error: "Invalid username or password" });
        }
    }
    catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ error: "Login failed" });
    }
})

app.post('/score', authenticateToken, async (req, res) => {
    try {
        const { score, letter_set } = req.body; // get score and letter set from request body
        const id = req.user.id;

        // do we want to add anything else?
        await db.query('INSERT INTO games (player_id, score, letter_set) VALUES (?, ?, ?)', [id, score, letter_set]);

        // Update user's high score and games played
        await db.query('UPDATE users SET high_score = GREATEST(high_score, ?), games_played = games_played + 1 WHERE id = ?', [score, id]);

        res.json({
            message: 'Score submitted successfully with score ',
            score: score
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to submit score' });
    }
})

app.get('/me', authenticateToken, async (req, res) => {
    try {
        const id = req.user.id; // from JWT payload (set by authenticateToken middleware)
        const [rows] = await db.query('SELECT id, username, high_score, games_played FROM users WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const user = rows[0];
        res.json({ user }); // send user info back
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch user info' });
    }
});

app.post('/friend-request', authenticateToken, async (req, res) => {
    try {
        const { username } = req.body;
        const userId = req.user.id;

        // find id of requested friend
        const [users] = await db.query('SELECT id from users WHERE username = ?', [username]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const friendId = users[0].id;

        // insert friend request into friendship table
        await db.query('INSERT INTO friendships (requester_id, addressee_id) VALUES (?, ?)', [userId, friendId]);
        res.json({ message: 'Friend request sent' });
    }
    catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Friend request already sent' });
        }
        console.error(error);
        res.status(500).json({ error: 'Failed to send friend request' });
    }
}
);

app.get('/friends', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        // get list of users where friendship is accepted
        const [friends] = await db.query(`SELECT u.id, u.username
        FROM friendships f
        JOIN users u ON (
            (f.requester_id = ? AND f.addressee_id = u.id) OR
            (f.addressee_id = ? AND f.requester_id = u.id)
        )
        WHERE f.status = 'accepted'`, [userId, userId]);
        res.json({ friends });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch friends' });
    }
});

app.get("/friends/pending/received", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const [requests] = await db.query(
            `SELECT f.id AS friendship_id, u.id AS requester_id, u.username AS requester_name
       FROM friendships f
       JOIN users u ON f.requester_id = u.id
       WHERE f.addressee_id = ? AND f.status = 'pending'`,
            [userId]
        );
        res.json(requests);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch pending received requests" });
    }
});
console.log(
    "Registered routes:",
    app._router.stack
        .filter(r => r.route)
        .map(r => `${Object.keys(r.route.methods)[0].toUpperCase()} ${r.route.path}`)
);
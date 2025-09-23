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
        const { score, letter_set, mode, challengeId } = req.body; // get score and letter set from request body
        const id = req.user.id;

        // do we want to add anything else?
        await db.query('INSERT INTO games (player_id, score, letter_set, mode, challenge_id) VALUES (?, ?, ?, ?, ?)', [id, score, letter_set, mode, challengeId || null]);

        // Update user's high score and games played
        await db.query('UPDATE users SET high_score = GREATEST(high_score, ?), games_played = games_played + 1 WHERE id = ?', [score, id]);

        // If it's a solo game, just return
        if (!challengeId) {
            return res.json({ message: "Solo game saved", score });
        }

        // Get all games for this challenge
        const [games] = await db.query(
            `SELECT g.player_id, g.score
     FROM games g
     WHERE g.challenge_id = ?`,
            [challengeId]
        );

        if (games.length < 2) {
            return res.json({ message: "Challenge game saved, waiting for opponent", score });
        }

        // Both players submitted → finalize
        const [playerA, playerB] = games;
        let winnerId = null;
        if (playerA.score > playerB.score) winnerId = playerA.player_id;
        else if (playerB.score > playerA.score) winnerId = playerB.player_id;

        await db.query(
            `UPDATE challenges
     SET status = 'completed' WHERE id = ?`,
            [challengeId]
        );

        // Update users’ stats
        if (winnerId) {
            const loserId = (winnerId === playerA.player_id ? playerB.player_id : playerA.player_id);
            await db.query(`UPDATE users SET wins = wins + 1 WHERE id = ?`, [winnerId]);
            await db.query(`UPDATE users SET losses = losses + 1 WHERE id = ?`, [loserId]);
        } else {
            await db.query(`UPDATE users SET ties = ties + 1 WHERE id IN (?, ?)`, [
                playerA.player_id,
                playerB.player_id,
            ]);
        }

        res.json({ message: "Challenge completed", winnerId, score });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to submit score' });
    }
})

app.get('/me', authenticateToken, async (req, res) => {
    try {
        const id = req.user.id; // from JWT payload (set by authenticateToken middleware)
        const [rows] = await db.query('SELECT id, username, high_score, games_played, wins, losses FROM users WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const user = rows[0];
        const [friends] = await db.query(`SELECT u.id, u.username
        FROM friendships f
        JOIN users u ON (
            (f.requester_id = ? AND f.addressee_id = u.id) OR
            (f.addressee_id = ? AND f.requester_id = u.id)
        )
        WHERE f.status = 'accepted'`, [id, id]);
        const [requests] = await db.query(
            `SELECT f.id AS friendship_id, u.id AS requester_id, u.username AS requester_name
       FROM friendships f
       JOIN users u ON f.requester_id = u.id
       WHERE f.addressee_id = ? AND f.status = 'pending'`,
            [id]
        );

        const [challenges] = await db.query(
            `SELECT c.id, c.created_at, u.username AS challenger_username, c.status
       FROM challenges c
       JOIN users u ON c.challenger_id = u.id
       WHERE c.challenged_id = ? AND c.status = 'pending'`,
            [id]
        );
        res.json({
            username: user.username, high_score: user.high_score, games_played: user.games_played,
            wins: user.wins, losses: user.losses, friends: friends, requests: requests, challenges: challenges
        }); // send user info back
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch user info' });
    }
});

// create friend request:
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

// accept friend request:
app.post("/friends/accept", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { requester_id } = req.body;
        // update friendship status to accepted
        const [result] = await db.query(
            `UPDATE friendships set STATUS = 'accepted' WHERE requester_id = ? AND addressee_id = ? AND status = 'pending'`,
            [requester_id, userId]
        )
        res.json({ message: "Friend request accepted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to accept friend request" });
    }
});

// decline friend request:
app.post("/friends/decline", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { requester_id } = req.body;
        // update friendship status to accepted
        const [result] = await db.query(
            `UPDATE friendships set STATUS = 'rejected' WHERE requester_id = ? AND addressee_id = ? AND status = 'pending'`,
            [requester_id, userId]
        )
        res.json({ message: "Friend request reject" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to reject friend request" });
    }
});

// TODO: include letter set information in front end
app.post("/challenge", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { friend_id } = req.body;
        const [result] = await db.query(`INSERT into challenges (challenger_id, challenged_id ) VALUES (?, ?)`, [userId, friend_id]);

        res.json({ message: "Challenge sent", challengeId: result.insertId });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to send challenge" });
    }
});

app.post("/challenges/:id/accept", authenticateToken, async (req, res) => {
    const challengeId = req.params.id;
    const playerId = req.user.id;

    // Check if the user is the one who was challenged
    const [rows] = await db.query(
        `SELECT * FROM challenges 
     WHERE id = ? AND challenged_id = ? AND status = 'pending'`,
        [challengeId, playerId]
    );
    if (rows.length === 0) {
        return res.status(403).json({ error: "You cannot accept this challenge." });
    }

    // Update status to "accepted"
    await db.query(
        `UPDATE challenges SET status = 'accepted' WHERE id = ?`,
        [challengeId]
    );

    // Check if Player A (challenger) already has a game with a letter set
    const [gameRows] = await db.query(
        `SELECT letter_set FROM games WHERE challenge_id = ? ORDER BY created_at ASC LIMIT 1`,
        [challengeId]
    );

    let letterSet;
    if (gameRows.length > 0) {
        // Reuse challenger’s letter set
        letterSet = gameRows[0].letter_set;
    } else {
        // Challenger hasn’t started yet → generate new set
        letterSet = [];
    }

    res.json({ challengeId, letterSet });
});
console.log(
    "Registered routes:",
    app._router.stack
        .filter(r => r.route)
        .map(r => `${Object.keys(r.route.methods)[0].toUpperCase()} ${r.route.path}`)
);
import express from "express";
import cors from "cors";
import { StreamChat } from "stream-chat";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";

const app = express();
app.use(cors());
app.use(express.json());
const port = 3001;
// try to make these env variables
const api_key = "egbeshbpypm3";
const api_secret = "z6kmx5s72ahzn976xdf9mp3tmbmkd9jmk3j95sd627bcbcmujj2ztq5cbmhjekcd";

const serverClient = StreamChat.getInstance(api_key, api_secret);

// run "npm start"
app.listen(port, () => {
    console.log("server running on port 3001");
})
app.post("/signup", async (req, res) => {
    try {
        const { username, password } = req.body;
        const userId = uuidv4(); // random id generator
        const hashedPassword = await bcrypt.hash(password, 10);
        const token = serverClient.createToken(userId); // create token from StreamAPI
        res.json({ token, username, password, userId, hashedPassword }) // send info back to frontend
    }
    catch (error) {
        res.json({ error })
    }
})
app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const { users } = await serverClient.queryUsers({ name: username });
        if (users.length === 0) {
            return res.status(500).json({ message: "User not found" });
        }
        const token = serverClient.createToken(users[0].id);
        const passwordMatch = await bcrypt.compare(password, users[0].hashedPassword);

        // if password matches, then we want to log in 
        if (passwordMatch) {
            res.status(200).json({ token, username, userId: users[0].id })
        }
        else {
            console.log("Passwords don't match")
        }
    }
    catch (error) {
        console.error("Error: ", error);
        res.json({ error });
    }
})

app.post("/home", async (req, res) => {
    try {
        console.log(req.body)
        const { score, username } = req.body
        if (!score) {
            return res.status(400).json({ status: 'failed' })
        }
        res.status(200).json({ status: "received", score: score, username: username })
    }
    catch (error) {
        console.error(error)
        res.status(500).json({ error })
    }
})

app.get("/home", async (req, res) => {
    res.status(200).json({ hello: 'hello' })
})
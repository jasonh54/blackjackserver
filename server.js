const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

mongoose.connect("mongodb+srv://coderstudent1:kjZEkJFir70CXT3Y@cluster0.abd1g.mongodb.net/", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

const accountSchema = mongoose.Schema({
  username: String,
  password: String,
  email: String,
});

const deckSchema = mongoose.Schema({
  cards: Array,
});

const cardSchema = mongoose.Schema({
  suit: String,
  rank: String,
});

const handSchema = mongoose.Schema({
  cards: [cardSchema],
  totalValue: Number,
});

const gameSchema = mongoose.Schema({
  playerHand: handSchema,
  dealerHand: handSchema,
  deck: deckSchema,
  status: String, // e.g., "in-progress", "finished"
});

const Account = mongoose.model("Account", accountSchema);


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/api/register", async (req, res) => {
  const { username, password, email } = req.body;   
    if (!username || !password || !email) {
        return res.status(400).json({ error: "All fields are required" });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newAccount = new Account({
            username,
            password: hashedPassword,
            email,
        });
        await newAccount.save();
        res.status(201).json({ message: "Account created successfully" });
    } catch (error) {
        console.error("Error creating account:", error);
        res.status(500).json({ error: "Internal server error" });
    }   
});
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }
    try {
        const account = await Account.findOne({ username });
        if (!account) {
            return res.status(404).json({ error: "Account not found" });
        }   
        const isPasswordValid = await bcrypt.compare(password, account.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid password" });
        }   
        res.status(200).json({ message: "Login successful", account });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/api/accounts", async (req, res) => {
  try {
    const accounts = await Account.find();
    res.status(200).json(accounts);
  } catch (error) {
    console.error("Error fetching accounts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(3001, () => {
  console.log("Server is running on http://localhost:3000");
});




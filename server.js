import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.WEBSITE_URL
}));

app.use(express.json());

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

app.post("/send", async (req, res) => {
    try {
            const { firstName, lastName, email, phoneNumber, topic, message, agreement } = req.body;

        if (!firstName || !lastName || !email || !phoneNumber || !topic || !message) {
            return res.status(400).json({ ok: false, error: "Required fields are missing" });
        }

        if (agreement !== "on") {
            return res.status(400).json({ ok: false, error: "Agreement not accepted" });
        }

        const text = `
📩 <b>New form message</b>
👤 Name: ${firstName} ${lastName}
📧 Email: ${email}
📱 Phone: ${phoneNumber}
📝 Topic: ${topic}
💬 Message: ${message}
✅ Agreement: ${agreement ? "Yes" : "No"}
`;

        const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: text,
                parse_mode: "HTML",
            }),
        });

        const data = await tgRes.json();

        if (!data.ok) {
            throw new Error(data.description || "Telegram API error");
        }

        res.json({ ok: true, message: "Send Message" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port = ${PORT}`));

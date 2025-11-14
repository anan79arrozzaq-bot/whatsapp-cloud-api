import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(bodyParser.json());

const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// SEND MESSAGE
app.post("/send", async (req, res) => {
  const { to, message } = req.body;

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: message }
      },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({ success: true, response: response.data });
  } catch (error) {
    res.json({ success: false, error: error.response?.data });
  }
});

// WEBHOOK VERIFICATION
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
});

// RECEIVE WEBHOOKS
app.post("/webhook", (req, res) => {
  console.log("Incoming:", JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

app.listen(3000, () => console.log("WA API ready on port 3000"));

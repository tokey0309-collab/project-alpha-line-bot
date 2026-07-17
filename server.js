const express = require("express");
const line = require("@line/bot-sdk");

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const app = express();

app.get("/", (req, res) => {
  res.send("LINE Bot is running!");
});

app.post("/webhook", line.middleware(config), async (req, res) => {
  try {
    const events = req.body.events;

    await Promise.all(
      events.map(async (event) => {
        if (event.type === "message" && event.message.type === "text") {
          return client.replyMessage(event.replyToken, {
            type: "text",
            text: `你說的是：${event.message.text}`,
          });
        }
      })
    );

    res.status(200).end();
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
});

const client = new line.Client(config);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on ${port}`);
});

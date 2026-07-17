const express = require("express");
const line = require("@line/bot-sdk");
const OpenAI = require("openai");

const lineConfig = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const app = express();
const lineClient = new line.Client(lineConfig);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("Project Alpha LINE AI Bot is running!");
});

app.post("/webhook", line.middleware(lineConfig), async (req, res) => {
  res.status(200).end();

  try {
    await Promise.all(req.body.events.map(handleEvent));
  } catch (error) {
    console.error("Webhook error:", error);
  }
});

async function handleEvent(event) {
  if (
    event.type !== "message" ||
    event.message.type !== "text"
  ) {
    return null;
  }

  const userMessage = event.message.text.trim();

  try {
    const response = await openai.responses.create({
      model: "gpt-5-mini",
      instructions: `
你是 Project Alpha AI 投資研究助理。
請用繁體中文回答。
回答務必簡潔、清楚，不保證獲利。
不可宣稱能自動下單或掌控使用者資金。
涉及即時股價、新聞或市場狀況時，要明確提醒資料可能不是即時。
若使用者問買賣建議，必須包含風險提醒。
      `,
      input: userMessage,
    });

    const answer =
      response.output_text?.trim() ||
      "目前無法產生回答，請稍後再試。";

    return lineClient.replyMessage(event.replyToken, {
      type: "text",
      text: answer.slice(0, 4900),
    });
  } catch (error) {
    console.error("OpenAI error:", error);

    return lineClient.replyMessage(event.replyToken, {
      type: "text",
      text: "系統暫時無法連線，請稍後再試。",
    });
  }
}

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Project Alpha Bot running on port ${port}`);
});

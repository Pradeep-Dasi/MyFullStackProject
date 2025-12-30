// api/index.js
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

let conn = null;

// Connect to MongoDB
async function connectToDB() {
  if (conn) return conn;
  conn = await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  return conn;
}

// Define schema
const pasteSchema = new mongoose.Schema({
  text: String,
  createdAt: { type: Date, default: Date.now },
  expiresAt: Date,
  views: { type: Number, default: 0 },
  maxViews: Number,
});

const Paste = mongoose.models.Paste || mongoose.model("Paste", pasteSchema);

// Serverless function handler
export default async function handler(req, res) {
  await connectToDB();

  if (req.method === "POST") {
    const { text, expireAfterMinutes, maxViews } = req.body;

    const paste = new Paste({
      text,
      expiresAt: expireAfterMinutes
        ? new Date(Date.now() + expireAfterMinutes * 60000)
        : null,
      maxViews: maxViews || 0,
    });

    await paste.save();

    res.status(200).json({ link: `/api/paste?id=${paste._id}` });
  } else if (req.method === "GET") {
    const { id } = req.query;

    const paste = await Paste.findById(id);
    if (!paste) return res.status(404).send("Paste not found");

    if (paste.expiresAt && new Date() > paste.expiresAt)
      return res.status(410).send("This paste has expired");

    if (paste.maxViews && paste.views >= paste.maxViews)
      return res.status(410).send("This paste has reached its maximum views");

    paste.views += 1;
    await paste.save();

    res.status(200).send(paste.text);
  } else {
    res.status(405).send("Method not allowed");
  }
}

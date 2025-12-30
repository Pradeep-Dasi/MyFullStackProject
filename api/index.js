// Backend/api/index.js
import mongoose from "mongoose";

// 1️⃣ MongoDB connection helper
const MONGODB_URI = process.env.MONGODB_URI;

let conn = null;
async function connectToDB() {
  if (conn) return conn;
  conn = await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  return conn;
}

// 2️⃣ Define Paste schema and model
const pasteSchema = new mongoose.Schema({
  text: String,
  createdAt: { type: Date, default: Date.now },
  expiresAt: Date,
  views: { type: Number, default: 0 },
  maxViews: Number,
});

const Paste = mongoose.models.Paste || mongoose.model("Paste", pasteSchema);

// 3️⃣ Serverless function handler
export default async function handler(req, res) {
  try {
    await connectToDB(); // connect to MongoDB

    if (req.method === "POST") {
      // Create a new paste
      const { text, expireAfterMinutes, maxViews } = req.body;

      const paste = new Paste({
        text,
        expiresAt: expireAfterMinutes
          ? new Date(Date.now() + expireAfterMinutes * 60000)
          : null,
        maxViews: maxViews || 0,
      });

      await paste.save();

      // Return link for viewing the paste
      res.status(200).json({ link: `/api?id=${paste._id}` });
    } else if (req.method === "GET") {
      // View a paste
      const { id } = req.query;

      if (!id) return res.status(400).send("Paste ID is required");

      const paste = await Paste.findById(id);
      if (!paste) return res.status(404).send("Paste not found");

      // Check if expired
      if (paste.expiresAt && new Date() > paste.expiresAt) {
        return res.status(410).send("This paste has expired");
      }

      // Check max views
      if (paste.maxViews && paste.views >= paste.maxViews) {
        return res.status(410).send("This paste has reached its maximum views");
      }

      paste.views += 1;
      await paste.save();

      res.status(200).send(paste.text);
    } else {
      res.status(405).send("Method not allowed");
    }
  } catch (error) {
    console.error("Serverless function error:", error);
    res.status(500).send("Internal Server Error");
  }
}

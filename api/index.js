const express = require('express');
const mongoose = require('mongoose');
const shortid = require('shortid');

const app = express();
const port = 3000;

// Connect to MongoDB (replace with your database URL)
mongoose.connect('mongodb://localhost:27017/pastebin', { useNewUrlParser: true, useUnifiedTopology: true });

const pasteSchema = new mongoose.Schema({
  text: String,
  createdAt: { type: Date, default: Date.now },
  expiresAt: Date,
  views: { type: Number, default: 0 },
  maxViews: Number
});

const Paste = mongoose.model('Paste', pasteSchema);

app.use(express.json());

// Route to create a new paste
app.post('/paste', async (req, res) => {
  const { text, expireAfterMinutes, maxViews } = req.body;

  const paste = new Paste({
    text: text,
    expiresAt: expireAfterMinutes ? new Date(Date.now() + expireAfterMinutes * 60000) : null,
    maxViews: maxViews || 0
  });

  await paste.save();

  res.send({ link: `http://localhost:${port}/paste/${paste.id}` });
});

// Route to view a paste
app.get('/paste/:id', async (req, res) => {
  const paste = await Paste.findById(req.params.id);

  if (!paste) return res.status(404).send('Paste not found');

  // Check if paste expired or reached max views
  if (paste.expiresAt && new Date() > paste.expiresAt) {
    return res.status(410).send('This paste has expired');
  }

  if (paste.maxViews && paste.views >= paste.maxViews) {
    return res.status(410).send('This paste has reached its maximum views');
  }

  paste.views += 1;
  await paste.save();

  res.send(paste.text);
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
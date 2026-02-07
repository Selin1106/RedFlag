import express from "express";
import cors from "cors";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const lexicon = JSON.parse(fs.readFileSync("./lexicon.json", "utf8"));

function scanLexicon(text) {
  const lower = text.toLowerCase();
  let matches = [];

  for (const category in lexicon) {
    for (const keyword of lexicon[category].keywords) {
      if (lower.includes(keyword.toLowerCase())) {
        matches.push({ category, keyword, severity: lexicon[category].severity });
      }
    }
  }

  return matches;
}

app.post("/analyze", async (req, res) => {
  const { message } = req.body;

  const matches = scanLexicon(message);

  // If serious threat detected:
  const highRisk = matches.some(m => m.severity >= 5);

  if (highRisk) {
    return res.json({
      reply: "Threat detected. If you feel unsafe right now, contact local emergency services immediately (e.g., 911 in Canada/US).",
      matches
    });
  }

  // Otherwise:
  if (matches.length > 0) {
    return res.json({
      reply: `Potential red flags detected (${matches.map(m => m.category).join(", ")}). Consider setting boundaries.`,
      matches
    });
  }

  return res.json({
    reply: "No major red flags detected in this message.",
    matches: []
  });
});

app.listen(3001, () => console.log("Backend running on http://localhost:3001"));

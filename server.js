import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "fs";
import { InferenceClient } from "@huggingface/inference";
import { v2 as cloudinary } from "cloudinary";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json());

const clientDist = path.join(__dirname, "client", "dist");

if (process.env.CLOUDINARY_URL) {
  // SDK reads cloudinary://key:secret@cloud_name from env
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const hfClient = new InferenceClient(process.env.HF_TOKEN);

const imageHistory = [];

const MODELS = {
  "flux-schnell": {
    id: "black-forest-labs/FLUX.1-schnell",
    provider: "together",
    label: "FLUX.1 Schnell (Fast)",
    defaultSteps: 5,
  },
  "flux-dev": {
    id: "black-forest-labs/FLUX.1-dev",
    provider: "together",
    label: "FLUX.1 Dev (Quality)",
    defaultSteps: 28,
  },
  "stable-diffusion-xl": {
    id: "stabilityai/stable-diffusion-xl-base-1.0",
    provider: "together",
    label: "Stable Diffusion XL",
    defaultSteps: 20,
  },
};

app.post("/api/generate", async (req, res) => {
  try {
    const {
      prompt,
      negative_prompt = "",
      num_inference_steps = 5,
      guidance_scale = 7.5,
      width = 1024,
      height = 1024,
      seed,
      model: modelKey = "flux-schnell",
      scheduler,
    } = req.body;

    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({ error: "Prompt is required." });
    }

    const selectedModel = MODELS[modelKey] || MODELS["flux-schnell"];

    const parameters = {
      num_inference_steps: Number(num_inference_steps),
      guidance_scale: Number(guidance_scale),
      width: Number(width),
      height: Number(height),
    };
    if (negative_prompt) parameters.negative_prompt = negative_prompt;
    if (seed !== undefined && seed !== "") parameters.seed = Number(seed);
    if (scheduler) parameters.scheduler = scheduler;

    console.log(`[GENERATE] model=${selectedModel.id} prompt="${prompt}"`);

    const imageBlob = await hfClient.textToImage({
      provider: selectedModel.provider,
      model: selectedModel.id,
      inputs: prompt,
      parameters,
    });

    const arrayBuffer = await imageBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const dataUri = `data:image/png;base64,${base64}`;

    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder: "ai-image-gen",
      public_id: `img_${uuidv4()}`,
      resource_type: "image",
    });

    const entry = {
      id: uuidv4(),
      prompt,
      negative_prompt,
      model: selectedModel.label,
      modelKey,
      parameters: {
        num_inference_steps,
        guidance_scale,
        width,
        height,
        seed,
        scheduler,
      },
      imageUrl: uploadResult.secure_url,
      cloudinaryId: uploadResult.public_id,
      createdAt: new Date().toISOString(),
    };
    imageHistory.unshift(entry);

    return res.json({ success: true, image: entry });
  } catch (err) {
    console.error("[GENERATE ERROR]", err);
    return res
      .status(500)
      .json({ error: err.message || "Image generation failed." });
  }
});

app.get("/api/history", (_req, res) => {
  res.json({ history: imageHistory });
});

app.get("/api/models", (_req, res) => {
  res.json({ models: MODELS });
});

app.delete("/api/history/:id", async (req, res) => {
  const idx = imageHistory.findIndex((e) => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  const [removed] = imageHistory.splice(idx, 1);
  try {
    await cloudinary.uploader.destroy(removed.cloudinaryId);
  } catch {
    /* ignore cloudinary delete errors */
  }
  res.json({ success: true });
});

if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(clientDist, "index.html"));
  });
} else {
  console.warn(
    "React build not found. Run: npm run build — or npm run dev for development."
  );
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

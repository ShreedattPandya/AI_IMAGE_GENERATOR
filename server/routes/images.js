import { Router } from "express";
import { InferenceClient } from "@huggingface/inference";
import { v2 as cloudinary } from "cloudinary";
import { v4 as uuidv4 } from "uuid";
import Image from "../models/Image.js";
import { protect, optionalAuth } from "../middleware/auth.js";

const router = Router();
const hfClient = new InferenceClient(process.env.HF_TOKEN);

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

// GET /api/models
router.get("/models", (_req, res) => {
  res.json({ models: MODELS });
});

// POST /api/generate — Protected
router.post("/generate", protect, async (req, res) => {
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

    console.log(`[GENERATE] user=${req.user.email} model=${selectedModel.id} prompt="${prompt}"`);

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

    const image = await Image.create({
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
      creator: req.user._id,
      creatorName: req.user.name,
    });

    return res.json({ success: true, image });
  } catch (err) {
    console.error("[GENERATE ERROR]", err);
    return res.status(500).json({ error: err.message || "Image generation failed." });
  }
});

// GET /api/explore — Public gallery with search + pagination
router.get("/explore", optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      model = "",
      sort = "newest",
    } = req.query;

    const query = { isPublic: true };

    if (search) {
      query.prompt = { $regex: search, $options: "i" };
    }
    if (model) {
      query.modelKey = model;
    }

    const sortOption =
      sort === "popular"
        ? { likes: -1, createdAt: -1 }
        : sort === "downloads"
        ? { downloads: -1, createdAt: -1 }
        : { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [images, total] = await Promise.all([
      Image.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Image.countDocuments(query),
    ]);

    // Add `likedByMe` flag if user is authenticated
    const userId = req.user?._id?.toString();
    const enriched = images.map((img) => ({
      ...img,
      likeCount: img.likes?.length || 0,
      likedByMe: userId ? img.likes?.some((l) => l.toString() === userId) : false,
    }));

    res.json({
      images: enriched,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error("[EXPLORE ERROR]", err);
    res.status(500).json({ error: "Failed to load explore gallery." });
  }
});

// GET /api/explore/:id — Single image details
router.get("/explore/:id", optionalAuth, async (req, res) => {
  try {
    const image = await Image.findById(req.params.id).lean();
    if (!image) return res.status(404).json({ error: "Image not found." });

    const userId = req.user?._id?.toString();
    res.json({
      image: {
        ...image,
        likeCount: image.likes?.length || 0,
        likedByMe: userId ? image.likes?.some((l) => l.toString() === userId) : false,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load image." });
  }
});

// GET /api/my-images — Protected, user's own images
router.get("/my-images", protect, async (req, res) => {
  try {
    const images = await Image.find({ creator: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      images: images.map((img) => ({
        ...img,
        likeCount: img.likes?.length || 0,
        likedByMe: true, // own images
      })),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load your images." });
  }
});

// POST /api/images/:id/like — Protected, toggle like
router.post("/images/:id/like", protect, async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ error: "Image not found." });

    const userId = req.user._id;
    const alreadyLiked = image.likes.some(
      (l) => l.toString() === userId.toString()
    );

    if (alreadyLiked) {
      image.likes = image.likes.filter(
        (l) => l.toString() !== userId.toString()
      );
    } else {
      image.likes.push(userId);
    }

    await image.save();

    res.json({
      success: true,
      liked: !alreadyLiked,
      likeCount: image.likes.length,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to toggle like." });
  }
});

// POST /api/images/:id/download — Track download count
router.post("/images/:id/download", async (req, res) => {
  try {
    const image = await Image.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloads: 1 } },
      { new: true }
    );
    if (!image) return res.status(404).json({ error: "Image not found." });
    res.json({ success: true, downloads: image.downloads });
  } catch (err) {
    res.status(500).json({ error: "Failed to track download." });
  }
});

// DELETE /api/images/:id — Protected, delete own image
router.delete("/images/:id", protect, async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ error: "Image not found." });

    if (image.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "You can only delete your own images." });
    }

    try {
      await cloudinary.uploader.destroy(image.cloudinaryId);
    } catch {
      /* ignore cloudinary delete errors */
    }

    await image.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete image." });
  }
});

export default router;

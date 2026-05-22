import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    prompt: {
      type: String,
      required: true,
      trim: true,
    },
    negative_prompt: {
      type: String,
      default: "",
    },
    model: {
      type: String,
      required: true,
    },
    modelKey: {
      type: String,
      required: true,
    },
    parameters: {
      num_inference_steps: Number,
      guidance_scale: Number,
      width: Number,
      height: Number,
      seed: Number,
      scheduler: String,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    cloudinaryId: {
      type: String,
      required: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    creatorName: {
      type: String,
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    downloads: {
      type: Number,
      default: 0,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

imageSchema.index({ createdAt: -1 });
imageSchema.index({ creator: 1 });
imageSchema.index({ isPublic: 1, createdAt: -1 });

const Image = mongoose.model("Image", imageSchema);
export default Image;

export const MODEL_OPTIONS = [
  { value: "flux-schnell", label: "FLUX.1 Schnell (Fast)" },
  { value: "flux-dev", label: "FLUX.1 Dev (Quality)" },
  { value: "stable-diffusion-xl", label: "Stable Diffusion XL" },
];

export const MODEL_DEFAULT_STEPS = {
  "flux-schnell": 5,
  "flux-dev": 28,
  "stable-diffusion-xl": 20,
};

export const SIZE_OPTIONS = ["512", "768", "1024", "1280"];

export const DEFAULT_FORM = {
  model: "flux-schnell",
  prompt: "",
  negative_prompt: "",
  num_inference_steps: 5,
  guidance_scale: 7.5,
  width: "1024",
  height: "1024",
  seed: "",
  scheduler: "",
};

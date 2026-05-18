import { MODEL_DEFAULT_STEPS, MODEL_OPTIONS, SIZE_OPTIONS } from "../constants";

export default function Sidebar({ form, setForm, loading, error, onGenerate }) {
  const update = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "model") {
        next.num_inference_steps = MODEL_DEFAULT_STEPS[value] ?? 5;
      }
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate();
  };

  return (
    <aside className="sidebar">
      <form onSubmit={handleSubmit}>
        <h2>Generation Settings</h2>

        <label htmlFor="model">Model</label>
        <select id="model" value={form.model} onChange={update("model")}>
          {MODEL_OPTIONS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>

        <label htmlFor="prompt">Prompt *</label>
        <textarea
          id="prompt"
          value={form.prompt}
          onChange={update("prompt")}
          placeholder="A cinematic photo of an astronaut riding a horse on Mars, golden hour lighting, ultra detailed..."
        />

        <label htmlFor="negative_prompt">Negative Prompt</label>
        <textarea
          id="negative_prompt"
          className="negative-prompt"
          value={form.negative_prompt}
          onChange={update("negative_prompt")}
          placeholder="blurry, bad quality, watermark, text..."
        />

        <label htmlFor="steps">
          Steps <span className="range-val">{form.num_inference_steps}</span>
        </label>
        <div className="range-row">
          <input
            id="steps"
            type="range"
            min="1"
            max="50"
            value={form.num_inference_steps}
            onChange={update("num_inference_steps")}
          />
        </div>

        <label htmlFor="guidance">
          Guidance Scale <span className="range-val">{form.guidance_scale}</span>
        </label>
        <div className="range-row">
          <input
            id="guidance"
            type="range"
            min="1"
            max="20"
            step="0.5"
            value={form.guidance_scale}
            onChange={update("guidance_scale")}
          />
        </div>

        <div className="row2">
          <div>
            <label htmlFor="width">Width (px)</label>
            <select id="width" value={form.width} onChange={update("width")}>
              {SIZE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="height">Height (px)</label>
            <select id="height" value={form.height} onChange={update("height")}>
              {SIZE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label htmlFor="seed">Seed (optional, for reproducibility)</label>
        <input
          id="seed"
          type="number"
          value={form.seed}
          onChange={update("seed")}
          placeholder="Leave blank for random"
        />

        <label htmlFor="scheduler">Scheduler (optional)</label>
        <input
          id="scheduler"
          type="text"
          value={form.scheduler}
          onChange={update("scheduler")}
          placeholder="e.g. DPMSolverMultistep"
        />

        <button type="submit" className="generate" disabled={loading}>
          {loading ? (
            <span className="spinner" />
          ) : (
            <span>✦ Generate Image</span>
          )}
        </button>

        {error && <div className="error-box">⚠ {error}</div>}
      </form>
    </aside>
  );
}

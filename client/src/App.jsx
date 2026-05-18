import { useCallback, useEffect, useState } from "react";
import { fetchHistory, generateImage } from "./api";
import { DEFAULT_FORM } from "./constants";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ImageCard from "./components/ImageCard";
import Placeholder from "./components/Placeholder";
import History from "./components/History";

export default function App() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [current, setCurrent] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory()
      .then((data) => setHistory(data.history ?? []))
      .catch(() => {});
  }, []);

  const handleGenerate = useCallback(async () => {
    const prompt = form.prompt.trim();
    if (!prompt) {
      setError("Please enter a prompt.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const body = {
        prompt,
        negative_prompt: form.negative_prompt,
        num_inference_steps: Number(form.num_inference_steps),
        guidance_scale: Number(form.guidance_scale),
        width: Number(form.width),
        height: Number(form.height),
        model: form.model,
        seed: form.seed || undefined,
        scheduler: form.scheduler || undefined,
      };

      const data = await generateImage(body);
      setCurrent(data.image);
      setHistory((prev) => [data.image, ...prev]);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [form]);

  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url);
  };

  return (
    <>
      <Header />
      <div className="layout">
        <Sidebar
          form={form}
          setForm={setForm}
          loading={loading}
          error={error}
          onGenerate={handleGenerate}
        />
        <main className="main">
          <div className="result-area">
            {current ? (
              <ImageCard item={current} onCopyUrl={handleCopyUrl} />
            ) : (
              <Placeholder />
            )}
          </div>
          <History items={history} onSelect={setCurrent} />
        </main>
      </div>
    </>
  );
}

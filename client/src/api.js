const API = "";

export async function fetchHistory() {
  const res = await fetch(`${API}/api/history`);
  if (!res.ok) throw new Error("Failed to load history");
  return res.json();
}

export async function generateImage(body) {
  const res = await fetch(`${API}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Generation failed");
  return data;
}

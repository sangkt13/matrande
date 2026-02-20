
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { prompt, matrixState } = req.body || {};
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });

    // Bạn có thể nhúng matrixState để AI hiểu ma trận hiện tại
    const inputText = [
      "Bạn là trợ lý xây dựng ma trận blueprint y khoa (VDLS/Bloom/CLO).",
      "Nhiệm vụ: gợi ý phân bố câu hỏi, chỉnh CLO, Bloom, và đề xuất cải tiến ma trận.",
      "",
      "=== MATRIX STATE (JSON) ===",
      matrixState ? JSON.stringify(matrixState).slice(0, 180000) : "(empty)",
      "",
      "=== USER REQUEST ===",
      prompt
    ].join("\n");

    const response = await client.responses.create({
      model: "gpt-4.1-mini", // đổi model tùy bạn
      input: inputText
    });

    // openai-node thường trả text qua output_text
    const text = response.output_text ?? "";
    return res.status(200).json({ text });
  } catch (err) {
    return res.status(500).json({
      error: "Server error",
      message: err?.message || String(err)
    });
  }
}

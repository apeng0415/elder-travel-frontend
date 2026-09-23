import type { IHomestay, IReview } from '@/data/types';
import { API_BASE } from '@/config';

interface LlmResult {
  text: string;
  homestays?: IHomestay[];
  crowd?: { name: string; days: string[]; values: number[] };
}

export async function chatWithLlm(
  userText: string,
  history: { role: string; text: string }[] = [],
  _all?: IHomestay[],
  _reviews?: IReview[],
): Promise<LlmResult> {
  try {
    const resp = await fetch(`${API_BASE}/api/chat/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userText,
        history,
      }),
    });

    if (!resp.ok) throw new Error(`后端返回错误：${resp.status}`);

    const data = await resp.json();
    if (data.status !== 'success') throw new Error(data.message || '后端返回失败');

    return {
      text: data.reply || '抱歉，我没听清，能再说一遍吗？',
      homestays: data.homestays || [],
    };
  } catch (err) {
    console.error('调用后端 AI 助手失败：', err);
    return {
      text: '网络开小差了，请检查后端是否启动（http://127.0.0.1:8000）。',
    };
  }
}
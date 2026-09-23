import { useEffect, useRef, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Send } from 'lucide-react';
import { useApp } from '@/store/store-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { composeReply, parseIntent } from '@/lib/ai';
import { chatWithLlm } from '@/lib/llm';
import type { IChatMessage } from '@/data/types';
import HomestayCard from '@/components/HomestayCard';
import { Mic, MicOff } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { API_BASE } from '@/config';

// 把浏览器录音的 webm 转成 16K 单声道 WAV
async function convertToWav(blob: Blob): Promise<Blob> {
  const arrayBuffer = await blob.arrayBuffer();
  const audioContext = new AudioContext({ sampleRate: 16000 });
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  const channelData = audioBuffer.getChannelData(0);
  const wavBuffer = new ArrayBuffer(44 + channelData.length * 2);
  const view = new DataView(wavBuffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + channelData.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, 16000, true);
  view.setUint32(28, 16000 * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, channelData.length * 2, true);

  let offset = 44;
  for (let i = 0; i < channelData.length; i++) {
    const s = Math.max(-1, Math.min(1, channelData[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    offset += 2;
  }

  return new Blob([wavBuffer], { type: 'audio/wav' });
}

const SUGGESTIONS = [
  '我70岁，腿脚不好，想找个安静的民宿住5天，最好离医院近一点',
  '这家民宿评价怎么样？',
  '下周去人多吗？想错峰出行',
  '帮我规划一下这5天怎么玩',
];

let mid = 0;
function nextId() { return `m-${Date.now()}-${mid++}`; }

export default function AssistantPage() {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

            mediaRecorder.onstop = async () => {
        // 先把原始 webm 转成 16K WAV
        const rawBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const wavBlob = await convertToWav(rawBlob);

        const formData = new FormData();
        formData.append('audio', wavBlob, 'recording.wav');

        try {
          const resp = await fetch(`${API_BASE}/api/voice/to_text/`, {
            method: 'POST',
            body: formData,
          });
          const data = await resp.json();
          if (data.status === 'success' && data.text) {
            setInput(data.text);
          } else {
            alert('没有识别到语音，请再试一次。');
          }
        } catch (err) {
          console.error(err);
          alert('语音识别失败，请检查后端是否启动。');
        }

        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error(err);
      alert('无法访问麦克风，请检查浏览器权限。');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
    }
  };

  const toggleRecording = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };
    // 把文字转成语音并播放
  const speakText = async (text: string) => {
    try {
      const resp = await fetch(`${API_BASE}/api/voice/to_text/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await resp.json();

      if (data.status === 'success' && data.audio_url) {
        const audio = new Audio(`${API_BASE}${data.audio_url}`);
        audio.play().catch(() => {
          console.warn('浏览器拦截了自动播放');
        });
      } else {
        console.error('语音合成失败：', data);
      }
    } catch (err) {
      console.error('调用语音合成接口失败：', err);
    }
  };
  const { homestays, reviews, currentUser } = useApp();
  const [messages, setMessages] = useState<IChatMessage[]>([
    { id: nextId(), role: 'assistant', text: `您好${currentUser?.name ?? ''}，我是您的旅居小助手。想住民宿、问评价、查客流，直接跟我说就行。` },
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, thinking]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || thinking) return;
    setMessages((m) => [...m, { id: nextId(), role: 'user', text: q }]);
    setInput('');
    setThinking(true);
    let reply: { text: string; homestays?: IChatMessage['homestays']; crowd?: IChatMessage['crowd'] };
    try {
      const history = messages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        text: m.text,
        homestays: m.homestays || [],
      }));
      reply = await chatWithLlm(q, history, homestays, reviews);
    } catch {
      // 大模型不可用时回退本地规则引擎，保证可用
      reply = composeReply(q, parseIntent(q), homestays, reviews);
    } finally {
      setThinking(false);
    }
    setMessages((m) => [...m, { id: nextId(), role: 'assistant', ...reply }]);
        // 自动播放 AI 回复的语音
    speakText(reply.text);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[92%] rounded-2xl px-4 py-3 text-lg leading-relaxed shadow-sm ${
              msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card border'
            }`}>
                <div className="text-base leading-relaxed space-y-2">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    strong: ({ ...props }) => (
                      <strong className="font-semibold text-orange-600" {...props} />
                    ),
                    p: ({ ...props }) => <p className="mb-2" {...props} />,
                    ul: ({ ...props }) => <ul className="list-disc pl-6 mb-2" {...props} />,
                    li: ({ ...props }) => <li className="mb-1" {...props} />,
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              </div>
              {msg.role === 'assistant' && (
                <button
                  onClick={() => speakText(msg.text)}
                  className="mt-2 text-sm text-primary hover:underline flex items-center gap-1"
                >
                  🔊 重播
                </button>
              )}
              {msg.homestays && msg.homestays.length > 0 && (
                <div className="mt-3 grid gap-2">
                  {msg.homestays.map((h) => <HomestayCard key={h.id} homestay={h} compact />)}
                </div>
              )}
              {msg.crowd && (
                <div className="mt-3 rounded-xl bg-orange-50 p-2">
                  <div className="text-base font-medium mb-1">未来7天客流 · {msg.crowd.name}</div>
                  <ReactECharts
                    style={{ height: 160 }}
                    option={{
                      grid: { left: 30, right: 10, top: 10, bottom: 24 },
                      tooltip: {},
                      xAxis: { type: 'category', data: msg.crowd.days, axisLabel: { fontSize: 12 } },
                      yAxis: { type: 'value', max: 100, axisLabel: { fontSize: 12 } },
                      series: [{ type: 'line', smooth: true, data: msg.crowd.values, areaStyle: { opacity: 0.2 }, color: '#E8722A' }],
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={endRef} />
        {thinking && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-card border px-4 py-3 text-lg text-muted-foreground">正在思考…</div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button key={s} onClick={() => send(s)} className="rounded-full border bg-card px-3 py-2 text-base text-primary hover-elevate">
            {s.length > 18 ? s.slice(0, 18) + '…' : s}
          </button>
        ))}
      </div>

            <div className="sticky bottom-20 flex gap-2 pb-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send(input)}
          placeholder="说说您的需求，例如：想找个安静的民宿"
          className="h-14 text-base flex-1"
        />
        <Button
          size="lg"
          variant={recording ? 'destructive' : 'outline'}
          className="h-14 px-4"
          onClick={toggleRecording}
        >
          {recording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        </Button>
                <Button size="lg" className="h-14 px-5" onClick={() => send(input)}>
          <Send className="h-6 w-6" /> 发送
        </Button>
      </div>
    </div>
  );
}

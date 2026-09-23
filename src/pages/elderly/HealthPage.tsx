import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Footprints, MapPin, Clock, CheckCircle, Mic, MicOff, AlertCircle, Pill } from 'lucide-react';
import { API_BASE } from '@/config';

interface RoutePoint {
  time: string;
  place: string;
  lng: number;
  lat: number;
}

interface HealthData {
  date: string;
  steps: number;
  route: RoutePoint[];
  feeling: string;
  medicine: string;
  streak: number;
  sedentary: boolean;
  minutes_since_active: number;
}

export default function HealthPage() {
  const [data, setData] = useState<HealthData | null>(null);
  const [feeling, setFeeling] = useState('');
  const [medicine, setMedicine] = useState('');
  const [recordingField, setRecordingField] = useState<'feeling' | 'medicine' | null>(null);
  const [loading, setLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const userId = localStorage.getItem('user_id') || '1';

  // 拉取今日健康数据
  const loadHealth = async () => {
    try {
      const resp = await fetch(`${API_BASE}/api/health/today/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: Number(userId) }),
      });
      const res = await resp.json();
      if (res.status === 'success') {
        setData(res.data);
        setFeeling(res.data.feeling || '');
        setMedicine(res.data.medicine || '');
      }
    } catch (err) {
      console.error('加载健康数据失败：', err);
    }
  };

  useEffect(() => {
    loadHealth();
  }, []);

    // 高德地图初始化
    // 高德地图初始化
  useEffect(() => {
    if (!data?.route || data.route.length === 0) return;

    const initMap = () => {
      const AMapLoader = (window as any).AMapLoader;
      AMapLoader.load({
        key: 'b383e7b2728aa10262b7fd390eab9497',
        version: '2.0',
      }).then((AMap: any) => {
        // 用第一个点作为地图中心
        const map = new AMap.Map('amap-container', {
          zoom: 15,
          center: [data.route[0].lng, data.route[0].lat],
        });

        // 画轨迹连线
        const path = data.route.map((p: any) => [p.lng, p.lat]);
        const polyline = new AMap.Polyline({
          path,
          strokeColor: '#f97316',
          strokeWeight: 5,
          strokeStyle: 'dashed',
          zIndex: 50,
        });
        map.add(polyline);

        // 画每个轨迹点
        data.route.forEach((p: any) => {
          const marker = new AMap.Marker({
            position: [p.lng, p.lat],
            title: p.place,
            label: {
              content: `<div style="padding:2px 6px;background:#fff;border:1px solid #f97316;border-radius:4px;font-size:12px;">${p.time} ${p.place}</div>`,
              direction: 'top',
            },
          });
          map.add(marker);
        });

        // 让地图自动缩放到包含所有点
        map.setFitView(polyline, false, [100, 100, 100, 100]);
      });
    };

    if ((window as any).AMapLoader) {
      initMap();
    } else {
      const timer = setInterval(() => {
        if ((window as any).AMapLoader) {
          clearInterval(timer);
          initMap();
        }
      }, 200);
    }
  }, [data]);

  // 签到
  const doCheckin = async () => {
    if (!feeling.trim() && !medicine.trim()) {
      toast.error('请说说今天的身体感受或服药情况');
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/health/checkin/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: Number(userId), feeling, medicine }),
      });
      const res = await resp.json();
      if (res.status === 'success') {
        toast.success(res.message);
        if (res.has_warning) {
          toast.warning('已记录，家属会关注您的身体情况');
        }
        loadHealth();
      } else {
        toast.error(res.message || '签到失败');
      }
    } catch (err) {
      console.error(err);
      toast.error('签到失败，请检查后端');
    } finally {
      setLoading(false);
    }
  };

  // webm -> wav
  const convertToWav = async (blob: Blob): Promise<Blob> => {
    const arrayBuffer = await blob.arrayBuffer();
    const audioContext = new AudioContext({ sampleRate: 16000 });
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const channelData = audioBuffer.getChannelData(0);

    const wavBuffer = new ArrayBuffer(44 + channelData.length * 2);
    const view = new DataView(wavBuffer);
    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
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
  };

  // 录音
  const startRecording = async (field: 'feeling' | 'medicine') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const rawBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const wavBlob = await convertToWav(rawBlob);
        const formData = new FormData();
        formData.append('audio', wavBlob, 'recording.wav');

        try {
          const resp = await fetch(`${API_BASE}/api/voice/to_text/`, {
            method: 'POST',
            body: formData,
          });
          const res = await resp.json();
          if (res.status === 'success' && res.text) {
            if (field === 'feeling') setFeeling(res.text);
            else setMedicine(res.text);
            toast.success('已识别，请确认后点击签到');
          } else {
            toast.error('没有识别到语音，请再试一次');
          }
        } catch (err) {
          console.error(err);
          toast.error('语音识别失败');
        }
        stream.getTracks().forEach((t) => t.stop());
        setRecordingField(null);
      };

      mediaRecorder.start();
      setRecordingField(field);
    } catch (err) {
      console.error(err);
      toast.error('无法访问麦克风');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingField) {
      mediaRecorderRef.current.stop();
    }
  };

  const toggleRecording = (field: 'feeling' | 'medicine') => {
    if (recordingField === field) stopRecording();
    else if (!recordingField) startRecording(field);
  };

  const stepGoal = 6000;
  const stepPercent = data ? Math.min(100, Math.round((data.steps / stepGoal) * 100)) : 0;

  return (
    <div className="space-y-5">
      {/* 久坐提醒 */}
      {data?.sedentary && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-semibold text-red-700 text-lg">该起来活动一下啦！</div>
            <div className="text-red-600 text-base mt-1">
              已经 {data.minutes_since_active} 分钟没动了，久坐对身体不好哦。
            </div>
          </div>
        </div>
      )}

      {/* 今日步数 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Footprints className="h-6 w-6 text-primary" /> 今日步数
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3 mb-4">
            <div className="text-4xl font-bold text-primary">{data?.steps ?? 0}</div>
            <div className="text-muted-foreground text-base mb-1">/ {stepGoal} 步</div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-400 to-orange-600 h-4 rounded-full transition-all"
              style={{ width: `${stepPercent}%` }}
            />
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            已完成目标的 {stepPercent}%
          </div>
        </CardContent>
      </Card>

      {/* 活动轨迹 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <MapPin className="h-6 w-6 text-primary" /> 今日活动轨迹
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div id="amap-container" className="w-full h-72 rounded-xl overflow-hidden border" />
        </CardContent>
      </Card>

      {/* 今日签到 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <CheckCircle className="h-6 w-6 text-primary" /> 今日签到
            {data?.streak ? (
              <span className="text-base text-orange-600 font-normal ml-2">
                已连续签到 {data.streak} 天
              </span>
            ) : null}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 身体感受 */}
          <div className="space-y-2">
            <Label className="text-base">今天感觉身体怎么样？</Label>
            <div className="flex gap-2">
              <Input
                value={feeling}
                onChange={(e) => setFeeling(e.target.value)}
                placeholder="例如：今天感觉身体很好"
                className="h-14 text-base flex-1"
                disabled={!!data?.feeling && data.feeling !== feeling}
              />
              <Button
                size="lg"
                variant={recordingField === 'feeling' ? 'destructive' : 'outline'}
                className="h-14 px-4"
                onClick={() => toggleRecording('feeling')}
              >
                {recordingField === 'feeling' ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* 服药情况 */}
          <div className="space-y-2">
            <Label className="text-base flex items-center gap-2">
              <Pill className="h-5 w-5 text-primary" /> 今天吃了什么药？（可选）
            </Label>
            <div className="flex gap-2">
              <Input
                value={medicine}
                onChange={(e) => setMedicine(e.target.value)}
                placeholder="例如：降压药 2次"
                className="h-14 text-base flex-1"
                disabled={!!data?.medicine && data.medicine !== medicine}
              />
              <Button
                size="lg"
                variant={recordingField === 'medicine' ? 'destructive' : 'outline'}
                className="h-14 px-4"
                onClick={() => toggleRecording('medicine')}
              >
                {recordingField === 'medicine' ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          <Button
            className="w-full h-14 text-lg"
            size="lg"
            onClick={doCheckin}
            disabled={loading || (!!data?.feeling && !!data?.medicine)}
          >
            {data?.feeling || data?.medicine
              ? '今天已经签到过了'
              : loading
              ? '保存中...'
              : '签到'}
          </Button>
        </CardContent>
      </Card>

      {/* 今日记录 */}
      {(data?.feeling || data?.medicine) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">今日记录</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">{data.date}</div>
            {data.feeling && (
              <div className="rounded-lg bg-orange-50 p-4">
                <div className="text-sm text-orange-600 font-medium mb-1">身体感受</div>
                <div className="text-lg">{data.feeling}</div>
              </div>
            )}
            {data.medicine && (
              <div className="rounded-lg bg-blue-50 p-4">
                <div className="text-sm text-blue-600 font-medium mb-1">服药情况</div>
                <div className="text-lg">{data.medicine}</div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
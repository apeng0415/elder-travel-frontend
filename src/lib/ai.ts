// AI 旅居助手：本地规则引擎模拟大模型 Function Calling。
// TODO(接真实大模型)：把 processUserQuery 替换为调用 通义千问/DeepSeek 的 /chat/completions，
// 并把 searchHomestay / predictCrowd / getReviewTags 注册为 tools，即可无缝升级为真实 Function Calling。
import type { IHomestay, IReview } from '@/data/types';

export interface IIntent {
  age?: number;
  needsElevator: boolean;
  nearHospital: boolean;
  quiet: boolean;
  wheelchair: boolean;
  days?: number;
  askingCrowd: boolean;
  askingReview: boolean;
  planning: boolean;
}

export function parseIntent(text: string): IIntent {
  const ageMatch = text.match(/(\d{2})\s*岁/);
  const daysMatch = text.match(/住?(\d+)\s*天/);
  return {
    age: ageMatch ? parseInt(ageMatch[1], 10) : undefined,
    needsElevator: /电梯|腿脚(不好|不便|不利索)|走不动|爬坡|台阶/.test(text),
    nearHospital: /医院|卫生院|诊所|看病/.test(text),
    quiet: /安静|清静|清净|不吵/.test(text),
    wheelchair: /轮椅/.test(text),
    days: daysMatch ? parseInt(daysMatch[1], 10) : undefined,
    askingCrowd: /人多|人少|挤|客流|周末|下周|旺季|淡季/.test(text),
    askingReview: /评价|口碑|怎么样|如何|住过/.test(text),
    planning: /规划|行程|安排|玩|路线|怎么玩/.test(text),
  };
}

export function searchHomestay(intent: IIntent, all: IHomestay[]): IHomestay[] {
  return all.filter((h) => {
    if ((intent.needsElevator || intent.wheelchair) && !h.elevator && !h.barrierFree) return false;
    if (intent.nearHospital && !h.nearHospital) return false;
    if (intent.quiet && !h.quiet) return false;
    return true;
  });
}

export function getReviewTags(homestayId: string, reviews: IReview[]): string[] {
  const freq = new Map<string, number>();
  reviews.filter((r) => r.homestayId === homestayId && r.approved).forEach((r) => {
    r.tags.forEach((t) => freq.set(t, (freq.get(t) ?? 0) + 1));
  });
  return [...freq.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
}

export function predictCrowd(h: IHomestay): { days: string[]; values: number[] } {
  const days: string[] = [];
  const today = new Date();
  for (let i = 1; i <= 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(`${d.getMonth() + 1}/${d.getDate()}`);
  }
  return { days, values: h.weekCrowd };
}

export function composeReply(
  text: string,
  intent: IIntent,
  homestays: IHomestay[],
  reviews: IReview[],
): { text: string; homestays?: IHomestay[]; crowd?: { name: string; days: string[]; values: number[] } } {
  if (/你好|您好|在吗|hi/i.test(text)) {
    return { text: '您好呀，我是您的旅居小助手。您可以直接跟我说，比如："我70岁，腿脚不好，想找个安静、离医院近的民宿住5天"，我来帮您安排。' };
  }

  const matched = searchHomestay(intent, homestays);

  if (intent.askingReview && matched.length > 0) {
    const top = matched[0];
    const tags = getReviewTags(top.id, reviews);
    return {
      text: `「${top.name}」的住客评价里，大家提到最多的是：${tags.slice(0, 4).join('、') || '暂无'}。综合评分 ${top.rating} 分。`,
      homestays: matched,
    };
  }

  if (matched.length === 0) {
    return { text: '我暂时没找到完全符合您要求的民宿，建议放宽"近医院/安静"的条件，或我帮您看看附近其他选择？' };
  }

  const best = matched[0];
  const tags = getReviewTags(best.id, reviews);
  const crowd = predictCrowd(best);
  const crowded = crowd.values.some((v) => v >= 85);

  let reply = '';
  if (intent.age) reply += `根据您 ${intent.age} 岁的情况，`;
  if (intent.needsElevator || intent.wheelchair) reply += '我优先为您筛选了有电梯或无障碍的住处。';
  if (intent.nearHospital) reply += '同时靠近医院，就医更放心。';
  reply += `为您推荐「${best.name}」：${best.desc}`;
  if (tags.length) reply += ` 住客评价里"${tags.slice(0, 3).join('"、"')}"出现最多。`;
  reply += ` 价格 ¥${best.price}/晚。`;
  if (intent.days) {
    reply += ` 按您住 ${intent.days} 天的计划，总费用约 ¥${best.price * intent.days}。`;
  }
  reply += crowded
    ? ' 不过未来几天这里客流偏高，建议错峰出行。'
    : ' 未来几天客流平稳，适合出行。';

  return { text: reply, homestays: matched.slice(0, 3), crowd: { name: best.name, ...crowd } };
}

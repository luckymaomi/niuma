/** 琨哥鼓励语：短句轮播，不写营销口号。每句都必须包含「琨哥」。 */
export const CHEERS: readonly string[] = [
  "加油，琨哥，你是最棒的",
  "琨哥今天也很能打",
  "再坚持一会儿就下班了，琨哥",
  "琨哥辛苦了，钱在往上跳",
  "慢慢来，琨哥已经很棒了",
  "今天也值得给自己点个赞，琨哥",
  "琨哥稳住，收工就有钱",
  "别急，琨哥，一分钟也在赚钱",
];

export function cheerAt(index: number): string {
  if (CHEERS.length === 0) return "加油，琨哥";
  const i = ((index % CHEERS.length) + CHEERS.length) % CHEERS.length;
  return CHEERS[i] ?? CHEERS[0]!;
}

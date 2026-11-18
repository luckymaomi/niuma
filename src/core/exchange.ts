export interface ExchangeItem {
  id: string;
  name: string;
  unit: string;
  price: number;
}

export interface ExchangeProgress {
  item: ExchangeItem;
  whole: number;
  fraction: number;
  progress: number;
  ratio: number;
}

export const EXCHANGE_ITEMS: ExchangeItem[] = [
  { id: "luckin", name: "瑞幸咖啡", unit: "杯", price: 15 },
  { id: "kfc-burger", name: "肯德基鸡腿堡", unit: "个", price: 18.5 },
  { id: "heytea", name: "喜茶", unit: "杯", price: 22 },
  { id: "mcdonald", name: "麦当劳套餐", unit: "份", price: 32 },
  { id: "bento", name: "盒饭", unit: "份", price: 25 },
  { id: "movie", name: "电影票", unit: "张", price: 45 },
];

export function exchangeProgress(earned: number, item: ExchangeItem): ExchangeProgress {
  const price = item.price > 0 ? item.price : 1;
  const safeEarned = Number.isFinite(earned) && earned > 0 ? earned : 0;
  const ratio = safeEarned / price;
  const whole = Math.floor(ratio);
  const fraction = ratio - whole;
  return {
    item,
    whole,
    fraction,
    progress: fraction,
    ratio,
  };
}

export function exchangeList(earned: number, items: ExchangeItem[] = EXCHANGE_ITEMS): ExchangeProgress[] {
  return items.map((item) => exchangeProgress(earned, item));
}

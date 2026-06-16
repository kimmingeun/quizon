export async function fetchMarketData() {
  const res = await fetch('https://quizon-api.vercel.app/api/market');
  if (!res.ok) throw new Error(`시장 데이터 불러오기 실패: ${res.status}`);
  const data = await res.json();
  return data.items;
}

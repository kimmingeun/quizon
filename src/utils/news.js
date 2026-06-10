export async function fetchStockNews() {
  const res = await fetch('https://quizon-api.vercel.app/api/news');

  if (!res.ok) throw new Error(`뉴스 불러오기 실패: ${res.status}`);

  const data = await res.json();
  return data.items;
}

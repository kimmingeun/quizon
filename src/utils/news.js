const CLIENT_ID = process.env.EXPO_PUBLIC_NAVER_CLIENT_ID;
const CLIENT_SECRET = process.env.EXPO_PUBLIC_NAVER_CLIENT_SECRET;

export async function fetchStockNews() {
  const query = encodeURIComponent('주식 증시');
  const url = `https://openapi.naver.com/v1/search/news.json?query=${query}&display=5&sort=date`;

  const res = await fetch(url, {
    headers: {
      'X-Naver-Client-Id': CLIENT_ID,
      'X-Naver-Client-Secret': CLIENT_SECRET,
    },
  });

  if (!res.ok) throw new Error(`뉴스 불러오기 실패: ${res.status}`);

  const data = await res.json();
  return data.items.map((item) => ({
    title: item.title.replace(/<[^>]+>/g, ''),
    link: item.link,
    pubDate: item.pubDate,
    description: item.description.replace(/<[^>]+>/g, ''),
  }));
}

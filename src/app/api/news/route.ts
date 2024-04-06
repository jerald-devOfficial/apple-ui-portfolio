import { NextResponse } from "next/server"

export async function GET() {
  try {
    const apiKey = process.env.NEWS_DATA_API_KEY;
    const apiUrl = `https://newsdata.io/api/1/news?apikey=${apiKey}&q=Programming,%20software%20development,%20Technology`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch news. Status: ${response.status}`);
    }
    const newsData = await response.json();
    return new NextResponse(JSON.stringify(newsData), { status: 200 });
  } catch (err) {
    return new NextResponse('Error fetching news data', { status: 500 });
  }
}
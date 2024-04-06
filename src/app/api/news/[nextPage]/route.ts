import { NextResponse } from "next/server"

interface IParams {
    nextPage: string;
  }

export async function GET(request: Request,
    { params }: { params: IParams }) {
    try {
      const { nextPage } = params
      const apiKey = process.env.NEWS_DATA_API_KEY;
      const apiUrl = `https://newsdata.io/api/1/news?apikey=${apiKey}&q=Programming,%20software%20development,%20Technology&page=${nextPage}`;
      const response = await fetch(apiUrl);
  
      if (!response.ok) {
        throw new Error(`Failed to fetch news. Status: ${response.status}`);
      }
  
      const newsData = await response.json();
      return new NextResponse(JSON.stringify(newsData), { status: 200 });
    } catch (error) {
      console.error('Error fetching news data:', error);
      return new NextResponse('Error fetching news data', { status: 500 });
    }
  }
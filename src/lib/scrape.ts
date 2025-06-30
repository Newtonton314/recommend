export async function googleSearch(query: string) {
    const params = new URLSearchParams({
      api_key: process.env.SERPAPI_KEY!,
      engine: "google",
      q: query,
      hl: "ja",
      gl: "jp"
    });
    const json = await fetch(`https://serpapi.com/search.json?${params}`).then(r=>r.json());
    return json.twitter_results?.map((t:any)=>t.link) ?? [];
  }
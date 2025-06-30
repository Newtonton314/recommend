import { enrichPerson } from "@/lib/enrich";
import { fetchTwitter } from "@/lib/twitter";
import { googleSearch } from "@/lib/scrape";
//import { summarize } from "@/lib/summarize";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { name, university, dob, notes } = await req.json();

  // プロファイル候補
  let profiles = await enrichPerson({name, university, dob, notes});
  if (!profiles.length) {
    profiles = await googleSearch(`${name} ${university} site:twitter.com`);
  }

  // Twitter データ例
  const twitter = profiles.find((p:any)=>p.type==="twitter");
  const twData = twitter ? await fetchTwitter(twitter.username) : null;

  // まとめて Perplexity で要約
  //const summary = await summarize({ name, university, dob, twData, notes });

  //return NextResponse.json({ profiles, summary });
}
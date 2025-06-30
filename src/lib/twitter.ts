export async function fetchTwitter(username: string) {
    const r = await fetch(
      `https://api.twitter.com/2/users/by/username/${username}?user.fields=description,public_metrics,created_at`,
      { headers: { Authorization: `Bearer ${process.env.TWITTER_BEARER}` } });
    return (await r.json()).data;
  }
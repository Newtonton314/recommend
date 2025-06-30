export async function enrichPerson(q: {
    name: string; university?: string; dob?: string; notes?: string;
  }) {
    const resp = await fetch(
      `https://api.peopledatalabs.com/v5/person/enrich`, {
        method: "POST",
        headers: { "Content-Type": "application/json",
                   "X-Api-Key": process.env.PDL_API_KEY! },
        body: JSON.stringify({ name: q.name, profiles: ["linkedin", "twitter"] })
      });
    const data = await resp.json();
    return data.data?.profiles ?? [];   // [{url,type,username}, …]
  }
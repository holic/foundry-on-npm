export async function* fetchReleases(
  repo: string
): AsyncGenerator<any, void, undefined> {
  const perPage = 100;
  const maxPages = 100;

  for (let page = 1; page < maxPages; page++) {
    const url = `https://api.github.com/repos/${repo}/releases?per_page=${perPage}&page=${page}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(
        `Failed to fetch: ${res.status} ${res.statusText} (${url})`
      );
    }
    const releases = await res.json();
    for (const release of releases) {
      yield release;
    }
    if (releases.length < perPage) {
      // all done
      return;
    }
  }

  throw new Error(
    `Fetched more than ${maxPages} pages of releases. It might be time to rewrite this.`
  );
}

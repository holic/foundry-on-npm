import { iteratorToArray } from "./common";
import { fetchReleases } from "./fetchReleases";

export type Nightly = {
  readonly tagName: string;
  readonly createdAt: Date;
  readonly version: string;
  readonly assets: readonly {
    readonly name: string;
    readonly platform: string;
    readonly extension: string;
    readonly url: string;
  }[];
};

export async function fetchNightly(): Promise<readonly Nightly[]> {
  const releases = await iteratorToArray(fetchReleases("foundry-rs/foundry"));

  const nightlyTagPattern = /^nightly-([0-9a-f]{7})[0-9a-f]{33}$/;
  // TODO: refine platform pattern?
  const assetNamePattern = /^foundry_nightly_(.*)(\.zip|\.tar\.gz)$/;

  return releases
    .filter((release) => nightlyTagPattern.test(release.tag_name))
    .map((release) => {
      const [tagName, shortSha] = release.tag_name.match(nightlyTagPattern)!;
      if (!shortSha) throw new Error("Could not find short SHA in release tag");

      return {
        tagName,
        createdAt: new Date(release.created_at),
        version: `0.2.0-nightly.${shortSha}`,
        assets: release.assets
          .filter((asset: any) => assetNamePattern.test(asset.name))
          .map((asset: any) => ({
            name: asset.name,
            platform: asset.name.replace(assetNamePattern, "$1"),
            extension: asset.name.replace(assetNamePattern, "$2"),
            url: asset.browser_download_url,
          })),
      };
    });
}

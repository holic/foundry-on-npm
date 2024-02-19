import { execSync } from "node:child_process";
import fs from "node:fs/promises";
import stream from "node:stream";
import yauzl from "yauzl-promise";
import tar from "tar";
import { Nightly } from "./fetchNightly";

const foundryDir = `${__dirname}/../bin/foundry`;

export async function publishNightly(release: Nightly): Promise<void> {
  console.log("cleaning up");
  await fs.rm(foundryDir, { recursive: true, force: true });

  console.log("fetching assets");
  await Promise.all(
    release.assets.map(async (asset) => {
      const dir = `${foundryDir}/${asset.platform}`;
      await fs.mkdir(dir, { recursive: true });

      if (asset.extension === ".zip") {
        console.log("downloading", asset.name);
        const contents = await fetch(asset.url).then((res) =>
          res.arrayBuffer()
        );
        console.log("unpacking", asset.name);
        const zip = await yauzl.fromBuffer(Buffer.from(contents));
        for await (const entry of zip) {
          const readStream = await zip.openReadStream(entry);
          await fs.writeFile(`${dir}/${entry.filename}`, readStream);
        }
      } else if (asset.extension === ".tar.gz") {
        console.log("downloading", asset.name);
        const contents = await fetch(asset.url).then((res) =>
          res.arrayBuffer()
        );
        console.log("unpacking", asset.name);
        await new Promise((resolve, reject) => {
          stream.Readable.from(Buffer.from(contents))
            .pipe(
              tar.x({
                cwd: dir,
              })
            )
            .once("close", resolve)
            .once("error", reject);
        });
      } else {
        throw new Error(`Unexpected asset extension: ${asset.name}`);
      }
    })
  );

  console.log("setting package version");
  execSync(
    `npm version ${release.version} --no-git-tag-version --allow-same-version`
  );
  console.log("doing clean install");
  execSync("npm clean-install");
  console.log("publishing");
  execSync(`npm publish --access public`);
}

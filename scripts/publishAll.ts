import { fetchNightly } from "../src/fetchNightly";
import packageJson from "../package.json";
import { execa } from "execa";
import { publishNightly } from "../src/publishNightly";

async function main() {
  const nightly = Array.from(await fetchNightly());
  nightly.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  if (!nightly.length) {
    throw new Error(
      "No nightly releases found. Did the foundryup release tag format change?"
    );
  }
  const latestNightly = nightly[nightly.length - 1]!;

  const versions = await execa("npm", [
    "view",
    packageJson.name,
    "versions",
    "--json",
  ]).then(
    (result) => JSON.parse(result.stdout) as readonly string[],
    (error) => {
      try {
        const npmError = JSON.parse(error.stdout);
        if (npmError.error.code === "E404") {
          return [] as readonly string[];
        }
        throw error;
      } catch (parseError) {
        throw error;
      }
    }
  );

  const nightlyToPublish = nightly.filter(
    (release) => !versions.includes(release.version)
  );
  console.log(
    "found",
    nightlyToPublish.length,
    "nightly releases ready to publish"
  );

  for (const release of nightlyToPublish) {
    console.log("publishing version", release.version);
    await publishNightly(release);

    // the above publish defaults to using `latest` tag, so we'll reset it below
    // to make sure we're always marking the latest nightly as both `latest` and `nightly`
    for (const tag of ["latest", "nightly"]) {
      console.log(
        "setting npm dist tag",
        tag,
        "to version",
        latestNightly.version
      );
      await execa("npm", [
        "dist-tag",
        "add",
        `${packageJson.name}@${latestNightly.version}`,
        tag,
      ]);
    }
  }
}

main().catch(console.error);

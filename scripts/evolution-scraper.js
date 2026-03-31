import { writeFile } from "fs/promises";
import { get } from "https";

async function _get(url) {
  return new Promise((resolve, reject) => {
    get(url, (response) => {
      let data = "";
      response.on("data", (chunk) => {
        data += chunk;
      });
      response.on("end", () => {
        resolve(data);
      });
    }).on("error", reject);
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const url = "https://pokeapi.co/api/v2/evolution-chain/?";
const chains = [];
for (let i = 0; i < 541; i++) {
  try {
    const response = await _get(url.replace("?", i + 1));
    chains.push(JSON.parse(response));
  } catch (err) {
    console.log(err);
    console.log("failed to get chain for generation " + (i + 1));
    break;
  }
  await sleep(1000);
}

await writeFile("data/evolution-chains.json", JSON.stringify(chains, null, 2));

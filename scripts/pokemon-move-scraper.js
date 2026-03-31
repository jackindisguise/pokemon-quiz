import path from "path";
import { get } from "https";
import { launch } from "puppeteer";
import { readFile, writeFile } from "fs/promises";
import { createWriteStream, existsSync } from "fs";

// pokemon list data
import pokemonList from "../data/pokemon.json" with { type: "json" };
import movesList from "../data/moves.json" with { type: "json" };

function getMove(name) {
	return movesList.find((move) => move.name === name);
}

function getPokemonByName(name) {
	return pokemonList.find((pokemon) => pokemon.pokemon === name);
}

// where to save moves
const pokemonMovesPath = "data/replacement-pokemon-moves.json";

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

const replacement = [
	"Nidoran♀",
	"Nidoran♂",
	"Farfetch'd",
	"Mr. Mime",
	"Deoxys",
	"Wormadam",
	"Mime Jr.",
	"Kyurem",
	"Flabébé",
	"Meowstic",
	"Hoopa",
	"Lycanroc",
	"Type: Null",
	"Toxtricity",
	"Sirfetch'd",
	"Mr. Rime",
	"Urshifu",
	"Calyrex",
];

// prep
const URL = "https://pokemondb.net/pokedex/?/moves/9"; // replace ? with pokemon name to show generation 9 movelist
const browser = await launch();
const page = await browser.newPage();
const pokemonMoves = [];
for (let i = 0; i < replacement.length; i++) {
	// 3 tries
	for (let j = 0; j < 3; j++) {
		try {
			const pokemon = getPokemonByName(replacement[i]);
			const url = URL.replace(
				"?",
				(function () {
					return pokemon.pokemon
						.toLowerCase()
						.replace(" ", "-")
						.replace("♀", "-f")
						.replace("♂", "-m")
						.replace("'", "")
						.replace(".", "")
						.replaceAll("é", "e")
						.replace(":", "");
				})(),
			).replace("9", `${9 - j}`);
			console.log(url);
			await page.goto(url);
			let table = await page.$(
				".sv-tabs-panel > div > div:nth-child(1) > div:nth-child(3) > table",
			);
			if (!table) table = await page.$(".sv-tabs-panel > div > table");
			const rows = await table.$$("tbody > tr");
			const moves = await Promise.all(
				rows.map(async (row) => {
					const cells = await row.$$("td");
					const level = await cells[0].evaluate((el) =>
						parseInt(el.textContent),
					);
					const moveName = await cells[1].evaluate((el) => el.textContent);
					return { level, move: getMove(moveName).id };
				}),
			);
			pokemonMoves.push({ pokemon: pokemon.id, moves });
			break;
		} catch (err) {
			console.log(err);
			console.log("Trying again...");
		}
		await sleep(1000);
	}
	await sleep(1000);
}
await page.close();
await browser.close();
await writeFile(pokemonMovesPath, JSON.stringify(pokemonMoves, null, 2));

import { readFile, writeFile } from "fs/promises";

const moves = await readFile("data/moves.tsv", "utf8");
let id = 1;
const movesArray = moves.split("\n").map((move) => {
	const [name, type, category, power, accuracy, pp, effect] = move.split("\t");
	const data = {
		id: id++,
		name,
		type,
		category,
	};
	if (power !== "—") {
		data.power = parseInt(power);
	}
	if (accuracy !== "—" && accuracy !== "∞") {
		data.accuracy = parseInt(accuracy);
	}
	data.pp = parseInt(pp);
	data.effect = effect;
	return data;
});
await writeFile("data/moves.json", JSON.stringify(movesArray, null, 2));

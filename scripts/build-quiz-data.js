import { writeFile } from "node:fs/promises";

import allMoves from "../data/moves.json" with { type: "json" };
import allPokemon from "../data/pokemon-big.json" with { type: "json" };
import allEvolutions from "../data/evolutions.json" with { type: "json" };

function isEffectivenessQuizMove(move) {
  if (move.category !== "Physical" && move.category !== "Special") return false;
  const p = move.power;
  if (p === null || p === undefined || p === "") return true;
  const n = Number(p);
  return !Number.isNaN(n) && n > 0;
}

const moves = allMoves.filter(isEffectivenessQuizMove).map((move) => ({
  name: move.name,
  type: move.type,
  category: move.category,
  power:
    move.power === null || move.power === undefined || move.power === ""
      ? null
      : Number(move.power),
}));

const pokemon = allPokemon
  .filter((entry) => Array.isArray(entry.type) && entry.type.length > 0)
  .map((entry) => ({
    id: entry.id,
    pokemon: entry.pokemon,
    type: entry.type,
  }));

const output = `const QUIZ_DATA = ${JSON.stringify({ moves, pokemon })};\n`;
const moveNameById = new Map(allMoves.map((move) => [move.id, move.name]));
const pokemonMovesets = allPokemon
  .map((entry) => {
    const uniqueMoveNames = [];
    const seen = new Set();
    for (const moveRef of entry.moves || []) {
      const moveName = moveNameById.get(moveRef.id);
      if (!moveName || seen.has(moveName)) continue;
      seen.add(moveName);
      uniqueMoveNames.push(moveName);
    }
    return {
      id: entry.id,
      pokemon: entry.pokemon,
      moves: uniqueMoveNames,
    };
  })
  .filter((entry) => entry.moves.length >= 4);
const movesetOutput = `const QUIZ_MOVESET_DATA = ${JSON.stringify({ pokemonMovesets })};\n`;

const allMoveNamesUnique = [
  ...new Set(allMoves.map((m) => m.name).filter(Boolean)),
];
const pokemonLearnMoves = [];
for (const entry of allPokemon) {
  if (!Array.isArray(entry.type) || entry.type.length === 0) continue;
  const learnedNames = [];
  const seen = new Set();
  for (const moveRef of entry.moves || []) {
    const moveName = moveNameById.get(moveRef.id);
    if (!moveName || seen.has(moveName)) continue;
    seen.add(moveName);
    learnedNames.push(moveName);
  }
  if (learnedNames.length === 0) continue;
  const decoysAvailable = allMoveNamesUnique.filter((n) => !seen.has(n)).length;
  if (decoysAvailable < 3) continue;
  pokemonLearnMoves.push({
    id: entry.id,
    pokemon: entry.pokemon,
    moves: learnedNames,
  });
}

const learnMoveOutput = `const QUIZ_LEARN_MOVE_DATA = ${JSON.stringify({
  pokemonLearnMoves,
  decoyMovePool: allMoveNamesUnique,
})};\n`;

const pokemonNameById = new Map(allPokemon.map((p) => [p.id, p.pokemon]));
const evolutionQuestionPool = {
  level: new Set(),
  time_of_day: new Set(),
  held_item: new Set(),
  item: new Set(),
  happiness: new Set(),
  location: new Set(),
  known_move: new Set(),
  known_move_type: new Set(),
  move_count: new Set(),
  party_species: new Set(),
  affection: new Set(),
  beauty: new Set(),
  method: new Set(),
};

const evolutionEntries = [];
for (const evo of allEvolutions) {
  const fromName = pokemonNameById.get(evo.from);
  const toName = pokemonNameById.get(evo.to);
  if (!fromName || !toName) continue;

  const requirements = evo.requirements || {};
  for (const [key, value] of Object.entries(requirements)) {
    if (!evolutionQuestionPool[key]) continue;
    if (value !== null && value !== undefined && value !== "") {
      evolutionQuestionPool[key].add(value);
    }
  }
  evolutionQuestionPool.method.add(evo.method);

  evolutionEntries.push({
    from: evo.from,
    to: evo.to,
    fromName,
    toName,
    method: evo.method,
    requirements,
  });
}

const evolutionQuizData = {
  evolutions: evolutionEntries,
  pools: Object.fromEntries(
    Object.entries(evolutionQuestionPool).map(([key, set]) => [key, [...set]]),
  ),
  moveNamesById: Object.fromEntries(
    allMoves.map((m) => [String(m.id), m.name]),
  ),
};
const evolutionOutput = `const QUIZ_EVOLUTION_DATA = ${JSON.stringify(
  evolutionQuizData,
)};\n`;

await writeFile(new URL("../quiz-data.js", import.meta.url), output, "utf8");
await writeFile(
  new URL("../quiz-moveset-data.js", import.meta.url),
  movesetOutput,
  "utf8",
);
await writeFile(
  new URL("../quiz-learn-move-data.js", import.meta.url),
  learnMoveOutput,
  "utf8",
);
await writeFile(
  new URL("../quiz-evolution-data.js", import.meta.url),
  evolutionOutput,
  "utf8",
);
console.log(
  `Generated quiz-data.js with ${moves.length} moves and ${pokemon.length} pokemon.`,
);
console.log(
  `Generated quiz-moveset-data.js with ${pokemonMovesets.length} pokemon movesets.`,
);
console.log(
  `Generated quiz-learn-move-data.js with ${pokemonLearnMoves.length} pokemon (learn-move quiz).`,
);
console.log(
  `Generated quiz-evolution-data.js with ${evolutionEntries.length} evolution entries.`,
);

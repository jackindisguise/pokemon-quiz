import { writeFile } from "node:fs/promises";
import rootChain from "../data/evolution-chains.json" with { type: "json" };
import allPokemon from "../data/pokemon-big.json" with { type: "json" };
import allMoves from "../data/moves.json" with { type: "json" };

const evolutions = [];
const pokemonIdByName = new Map();
const moveIdByName = new Map();

function normalizePokemonName(name) {
  return String(name)
    .toLowerCase()
    .replace(/\u2640/g, "-f")
    .replace(/\u2642/g, "-m")
    .replace(/\./g, "")
    .replace(/'/g, "")
    .replace(/\s+/g, "-")
    .trim();
}

function normalizeItemName(name) {
  switch (name) {
    case "kings-rock":
      return "King's Rock";
    default:
      return name
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
  }
}

function normalizeLocationName(name) {
  switch (name) {
    default:
      return name
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
  }
}

function normalizeMoveName(name) {
  return String(name)
    .toLowerCase()
    .replace(/'/g, "")
    .replace(/\./g, "")
    .replace(/,/g, "")
    .replace(/:/g, "")
    .replace(/\s+/g, "-")
    .trim();
}

for (const entry of allPokemon) {
  const rawName = String(entry.pokemon);
  const normalized = normalizePokemonName(rawName);
  pokemonIdByName.set(normalized, entry.id);
}

for (const move of allMoves) {
  const normalized = normalizeMoveName(move.name);
  moveIdByName.set(normalized, move.id);
}

function getPokemonIdBySpeciesName(name) {
  const key = normalizePokemonName(name);
  return pokemonIdByName.get(key) ?? null;
}

function parseEvolution(chain, species) {
  if (chain.evolves_to && chain.evolves_to.length > 0) {
    for (let _evolution of chain.evolves_to) {
      console.log(`${species.name} -> ${_evolution.species.name}`);
      const targetSpecies = _evolution.species;
      const fromId = getPokemonIdBySpeciesName(species.name);
      const toId = getPokemonIdBySpeciesName(targetSpecies.name);
      if (fromId === null || toId === null) {
        console.warn(
          `Skipping ${species.name} -> ${targetSpecies.name}; failed to resolve IDs (${fromId} -> ${toId})`,
        );
        continue;
      }
      for (let details of _evolution.evolution_details) {
        const evolution = {
          from: fromId,
          to: toId,
          method: details.trigger.name,
          requirements: {},
        };
        if (details.min_level) evolution.requirements.level = details.min_level;
        if (details.min_happiness)
          evolution.requirements.happiness = details.min_happiness;
        if (details.item)
          evolution.requirements.item = normalizeItemName(details.item.name);
        if (details.time_of_day)
          evolution.requirements.time_of_day = details.time_of_day;
        if (details.weather) evolution.requirements.weather = details.weather;
        if (details.min_affection)
          evolution.requirements.affection = details.min_affection;
        if (details.min_beauty)
          evolution.requirements.beauty = details.min_beauty;
        if (details.min_damage_taken)
          evolution.requirements.damage_taken = details.min_damage_taken;
        if (details.min_steps) evolution.requirements.steps = details.min_steps;
        if (details.min_move_count)
          evolution.requirements.move_count = details.min_move_count;
        if (details.location)
          evolution.requirements.location = normalizeLocationName(
            details.location.name,
          );
        if (details.held_item)
          evolution.requirements.held_item = normalizeItemName(
            details.held_item.name,
          );
        if (details.known_move)
          evolution.requirements.known_move = (() => {
            const moveName = details.known_move.name;
            const moveId = moveIdByName.get(normalizeMoveName(moveName));
            if (!moveId) {
              console.warn(
                `Could not resolve known_move '${moveName}' for ${species.name} -> ${targetSpecies.name}`,
              );
              return moveName;
            }
            return moveId;
          })();
        if (details.known_move_type)
          evolution.requirements.known_move_type = details.known_move_type.name;
        if (details.party_species)
          evolution.requirements.party_species = details.party_species.name;
        if (details.party_type)
          evolution.requirements.party_type = details.party_type.name;
        if (Object.keys(evolution.requirements).length == 0) {
          console.log(
            `${species.name} -> ${targetSpecies.name} has no requirements`,
          );
          delete evolution.requirements;
        }
        evolutions.push(evolution);
        if (_evolution.evolves_to && _evolution.evolves_to.length > 0) {
          parseEvolution(_evolution, targetSpecies);
        }
      }
    }
  }
}

for (let evolution of rootChain) {
  if (evolution.chain.evolves_to && evolution.chain.evolves_to.length > 0) {
    parseEvolution(evolution.chain, evolution.chain.species);
  }
}

writeFile("data/evolutions.json", JSON.stringify(evolutions, null, 2));

export enum TYPE_MASK {
	NORMAL = 1 << 1,
	FIRE = 1 << 2,
	WATER = 1 << 3,
	ELECTRIC = 1 << 4,
	GRASS = 1 << 5,
	ICE = 1 << 6,
	FIGHTING = 1 << 7,
	POISON = 1 << 8,
	GROUND = 1 << 9,
	FLYING = 1 << 10,
	PSYCHIC = 1 << 11,
	BUG = 1 << 12,
	ROCK = 1 << 13,
	GHOST = 1 << 14,
	DRAGON = 1 << 15,
	DARK = 1 << 16,
	STEEL = 1 << 17,
	FAIRY = 1 << 18,
}

export const NORMAL = TYPE_MASK.NORMAL;
export const FIRE = TYPE_MASK.FIRE;
export const WATER = TYPE_MASK.WATER;
export const ELECTRIC = TYPE_MASK.ELECTRIC;
export const GRASS = TYPE_MASK.GRASS;
export const ICE = TYPE_MASK.ICE;
export const FIGHTING = TYPE_MASK.FIGHTING;
export const POISON = TYPE_MASK.POISON;
export const GROUND = TYPE_MASK.GROUND;
export const FLYING = TYPE_MASK.FLYING;
export const PSYCHIC = TYPE_MASK.PSYCHIC;
export const BUG = TYPE_MASK.BUG;
export const ROCK = TYPE_MASK.ROCK;
export const GHOST = TYPE_MASK.GHOST;
export const DRAGON = TYPE_MASK.DRAGON;
export const DARK = TYPE_MASK.DARK;
export const STEEL = TYPE_MASK.STEEL;
export const FAIRY = TYPE_MASK.FAIRY;

export type TypeRelationship = {
	RESIST?: TYPE_MASK;
	IMMUNE?: TYPE_MASK;
	VULNERABLE?: TYPE_MASK;
};

export enum Modifier {
	IMMUNE = 0,
	DOUBLE_RESIST = 1 / 4,
	RESIST = 1 / 2,
	NORMAL = 1,
	VULNERABLE = 2,
	DOUBLE_VULNERABLE = 4,
}

export type Type = {
	name: string;
	mask: TYPE_MASK;
	strength: TypeRelationship;
};

export const TYPES: Type[] = [
	{
		name: "Normal",
		mask: NORMAL,
		strength: {
			RESIST: ROCK | STEEL,
			IMMUNE: GHOST,
		},
	},
	{
		name: "Fire",
		mask: FIRE,
		strength: {
			VULNERABLE: GRASS | ICE | BUG | STEEL,
			RESIST: FIRE | WATER | ROCK | DRAGON,
		},
	},
	{
		name: "Water",
		mask: WATER,
		strength: {
			VULNERABLE: FIRE | GROUND | ROCK,
			RESIST: WATER | GRASS | DRAGON,
		},
	},
	{
		name: "Electric",
		mask: ELECTRIC,
		strength: {
			VULNERABLE: WATER | FLYING,
			RESIST: ELECTRIC | GRASS | DRAGON,
			IMMUNE: GROUND,
		},
	},
	{
		name: "Grass",
		mask: GRASS,
		strength: {
			VULNERABLE: WATER | GROUND | ROCK,
			RESIST: FIRE | GRASS | POISON | FLYING | BUG | DRAGON | STEEL,
		},
	},
	{
		name: "Ice",
		mask: ICE,
		strength: {
			VULNERABLE: GRASS | GROUND | FLYING | DRAGON,
			RESIST: FIRE | WATER | ICE | STEEL,
		},
	},
	{
		name: "Fighting",
		mask: FIGHTING,
		strength: {
			VULNERABLE: NORMAL | ICE | ROCK | DARK | STEEL,
			RESIST: POISON | FLYING | PSYCHIC | BUG | FAIRY,
			IMMUNE: GHOST,
		},
	},
	{
		name: "Poison",
		mask: POISON,
		strength: {
			VULNERABLE: GRASS | FAIRY,
			RESIST: POISON | GROUND | ROCK | GHOST,
			IMMUNE: STEEL,
		},
	},
	{
		name: "Ground",
		mask: GROUND,
		strength: {
			VULNERABLE: FIRE | ELECTRIC | POISON | ROCK | STEEL,
			RESIST: GRASS | BUG,
			IMMUNE: FLYING,
		},
	},
	{
		name: "Flying",
		mask: FLYING,
		strength: {
			VULNERABLE: GRASS | FIGHTING | BUG,
			RESIST: ELECTRIC | ROCK | STEEL,
		},
	},
	{
		name: "Psychic",
		mask: PSYCHIC,
		strength: {
			VULNERABLE: FIGHTING | POISON,
			RESIST: PSYCHIC | STEEL,
			IMMUNE: DARK,
		},
	},
	{
		name: "Bug",
		mask: BUG,
		strength: {
			VULNERABLE: GRASS | PSYCHIC | DARK,
			RESIST: FIRE | FIGHTING | POISON | FLYING | STEEL | FAIRY,
		},
	},
	{
		name: "Rock",
		mask: ROCK,
		strength: {
			VULNERABLE: FIRE | ICE | FLYING | BUG,
			RESIST: FIGHTING | GROUND | STEEL,
		},
	},
	{
		name: "Ghost",
		mask: GHOST,
		strength: {
			VULNERABLE: GHOST | PSYCHIC,
			RESIST: DARK,
			IMMUNE: NORMAL,
		},
	},
	{
		name: "Dragon",
		mask: DRAGON,
		strength: {
			VULNERABLE: DRAGON,
			RESIST: STEEL,
			IMMUNE: FAIRY,
		},
	},
	{
		name: "Dark",
		mask: DARK,
		strength: {
			VULNERABLE: PSYCHIC | GHOST,
			RESIST: FIGHTING | DARK | FAIRY,
		},
	},
	{
		name: "Steel",
		mask: STEEL,
		strength: {
			VULNERABLE: ICE | ROCK | FAIRY,
			RESIST: FIRE | WATER | ELECTRIC | STEEL,
		},
	},
	{
		name: "Fairy",
		mask: FAIRY,
		strength: {
			VULNERABLE: FIGHTING | DRAGON | DARK,
			RESIST: FIRE | POISON | STEEL,
		},
	},
];

export const TYPE_MAP = new Map<TYPE_MASK, Type>(
	TYPES.map((type) => [type.mask, type]),
);

export const TYPE_NAMES = new Map<string, Type>(
	TYPES.map((type) => [type.name, type]),
);

export function getTypesFromMask(mask: TYPE_MASK): Type[] {
	return TYPES.filter((type) => (type.mask & mask) !== 0);
}

export function getTypeByName(name: string): Type | undefined {
	return TYPE_NAMES.get(name);
}

export function getTypeMaskByName(name: string): TYPE_MASK {
	const result = getTypeByName(name)?.mask;
	if (!result) {
		throw new Error(`Type ${name} not found`);
	}
	return result;
}

export function getTypeMasksByName(names: string[]): TYPE_MASK {
	let mask = 0;
	for (let name of names) {
		mask |= getTypeMaskByName(name);
	}
	return mask;
}

export function getModifier(attacker: TYPE_MASK, defender: TYPE_MASK): number {
	const attackerTypes = getTypesFromMask(attacker);
	const defenderTypes = getTypesFromMask(defender);
	let modifier: number = Modifier.NORMAL;
	for (const attackerType of attackerTypes) {
		for (const defenderType of defenderTypes) {
			const immune = (attackerType.strength.IMMUNE || 0) & defenderType.mask;
			const resistant = (attackerType.strength.RESIST || 0) & defenderType.mask;
			const vulnerable =
				(attackerType.strength.VULNERABLE || 0) & defenderType.mask;
			if (immune) modifier = Modifier.IMMUNE;
			else if (resistant) modifier *= Modifier.RESIST;
			else if (vulnerable) modifier *= Modifier.VULNERABLE;
		}
	}
	return modifier;
}

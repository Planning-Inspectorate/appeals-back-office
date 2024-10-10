import { functionTypeRegex } from './utils.js';

/**
 * @param {{block: string, typeIndex: number | null}[]} blocks
 * @param {string[]} typeStrings
 * @returns {string[]}
 */
const getUnassignedTypes = (blocks, typeStrings) => {
	const assignedTypesIndices = blocks.reduce((/** @type {number[]} */ acc, { typeIndex }) => {
		if (!typeIndex) return acc;
		return [...acc, typeIndex];
	}, []);
	return typeStrings.filter((_, ii) => !assignedTypesIndices.includes(ii));
};

/**
 * @param {{block: string, typeIndex: number | null}[]} blocks
 * @param {string[]} typeStrings
 * @returns {{block: string, type: string | null}[]}
 */
const writeTypesToBlocks = (blocks, typeStrings) =>
	blocks.map(({ block, typeIndex }) => ({
		block,
		type: typeIndex !== null ? typeStrings[typeIndex] : null
	}));
/**
 * @param {import("./cursor.js").Cursor} cursor
 */
export const getCodeSections = (cursor) => {
	/** @type {string[]} */
	const importStrings = [];

	/** @type {string[]} */
	const typeStrings = [];

	/** @type {{block: string, typeIndex: number | null}[]} */
	const blocks = [];

	let lastTypeIsFunctionType = false;
	let lastFunctionTypeAssigned = false;
	while (cursor.getState() !== 'end') {
		cursor.moveForward();

		if (cursor.getFragmentState() === 'contains-import') {
			importStrings.push(cursor.takeFragment());
		}

		if (cursor.getFragmentState() === 'contains-type') {
			const typeStr = cursor.takeFragment();
			typeStrings.push(typeStr);
			lastTypeIsFunctionType = !!functionTypeRegex.exec(typeStr);
			if (lastTypeIsFunctionType) {
				lastFunctionTypeAssigned = false;
			}
		}

		if (cursor.getFragmentState() === 'contains-codeblock') {
			const typeIndex =
				lastTypeIsFunctionType && !lastFunctionTypeAssigned ? typeStrings.length - 1 : null;
			if (typeIndex) lastFunctionTypeAssigned = true;
			blocks.push({ block: cursor.takeFragment(), typeIndex });
		}
	}

	const unassignedTypes = getUnassignedTypes(blocks, typeStrings);
	const blocksWithtypes = writeTypesToBlocks(blocks, typeStrings);

	return { importStrings, typeStrings: unassignedTypes, blocks: blocksWithtypes };
};

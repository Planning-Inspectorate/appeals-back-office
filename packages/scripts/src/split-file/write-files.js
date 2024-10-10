import { existsSync, mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import { camelToKebab } from './utils.js';

/**
 * @param {string} str
 * @returns {string}
 */
const extendPaths = (str) =>
	str.replaceAll(/(['"])(..\/)+(\w)/g, '$1$2../$3').replaceAll(/(['"])(.\/)+(\w)/g, '$1../$3');

/**
 * @param {{ block: string, type: string | null }} block
 * @param {string[]} importStrings
 * @param {string[]} typeStrings
 * @returns
 */
const createWritable = ({ block, type }, importStrings, typeStrings) => {
	const blockWithExport = block.startsWith('export') ? block : `export ${block}`;
	const blockWithTypesAndExport = type
		? `${extendPaths(type)}\n${blockWithExport}`
		: blockWithExport;
	const dataToWrite = `${extendPaths(importStrings.join('\n'))}\n\n${extendPaths(
		typeStrings.join('\n\n')
	)}\n\n${blockWithTypesAndExport}`;

	return dataToWrite;
};

/**
 * @param {string} block
 * @returns {string}
 */
const createBlockName = (block) => {
	const blockNameCaptureGroups = /(\w+) =|(\w+)\(/.exec(block);
	if (!blockNameCaptureGroups) {
		throw new Error('Could not find name for block: ' + block);
	}
	const blockName = blockNameCaptureGroups[1] || blockNameCaptureGroups[2];

	return blockName;
};

/**
 * @param {string} blockName
 * @returns
 */
const createFileName = (blockName) => {
	return camelToKebab(blockName) + '.js';
};

/**
 * @param {{ blockName: string, fileName: string }[]} blockAndFileNames
 */
const createIndexFileData = (blockAndFileNames) => {
	return blockAndFileNames.reduce(
		(acc, { blockName, fileName }) => `${acc}export { ${blockName} } from './${fileName}'\n`,
		''
	);
};

/**
 * @param {{ importStrings: string[], typeStrings: string[], blocks: {block: string, type: string | null}[] }} codeSections
 * @param {string} writeDirPath
 */
export const writeFiles = ({ importStrings, typeStrings, blocks }, writeDirPath) => {
	if (!existsSync(writeDirPath)) {
		mkdirSync(writeDirPath);
	}

	/** @type {{ blockName: string, fileName: string }[]} */
	const blockAndFileNames = [];

	for (const { block, type } of blocks) {
		const dataToWrite = createWritable({ block, type }, importStrings, typeStrings);
		const blockName = createBlockName(block);
		let fileName;
		try {
			fileName = createFileName(blockName);
		} catch (e) {
			console.warn(e);
			continue;
		}

		blockAndFileNames.push({ blockName, fileName });

		writeFileSync(path.join(writeDirPath, fileName), dataToWrite);
	}

	writeFileSync(path.join(writeDirPath, './index.js'), createIndexFileData(blockAndFileNames));
};

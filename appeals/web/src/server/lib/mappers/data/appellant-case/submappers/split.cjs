const fs = require('fs');
const path = require('path');

const camelToKebab = (str) =>
	str
		.replaceAll(/([a-z])([A-Z]+)/g, '$1-$2')
		.replaceAll(/([A-Z]{2,4})([A-Z])/g, '$1-$2')
		.toLowerCase();

const fileStr = fs.readFileSync(path.join(__dirname, './tmp.js')).toString();

const importStr = `import { appealSiteToAddressString } from '#lib/address-formatter.js';
import { dateISOStringToDisplayDate } from '#lib/dates.js';
import {
	booleanSummaryListItem,
	booleanWithDetailsSummaryListItem,
	documentSummaryListItem,
	textSummaryListItem
} from '#lib/mappers/components/index.js';
import { formatServiceUserAsHtmlList } from '#lib/service-user-formatter.js';
import { APPEAL_APPLICATION_DECISION } from 'pins-data-model';
import { documentUploadUrlTemplate, mapDocumentManageUrl } from '../common.js';
import { formatPlanningObligationStatus } from '#lib/display-page-formatter.js';

`;

const funcs = fileStr.split('\n\n');

const augmentedFuncs = funcs.map((funcStr) => {
	const [, funcName] = /export const (\w+)/.exec(funcStr);
	const writtenName = `map${funcName.substr(0, 1).toUpperCase()}${funcName.substr(1)}`;
	const writtenFuncStr = funcStr.replace(funcName, writtenName);
	const fileName = `${camelToKebab(funcName)}.js`;
	const importStatement = `import { ${writtenName} } from './submappers/${fileName}';`;

	return {
		fileName,
		funcStr: writtenFuncStr,
		funcName: writtenName,
		importStatement
	};
});

augmentedFuncs.forEach(({ fileName, funcStr }) => {
	fs.writeFileSync(path.join(__dirname, `./${fileName}`), importStr + funcStr);
});

const imports = augmentedFuncs.reduce((acc, { importStatement }) => {
	return acc + importStatement + '\n';
}, '');
console.log('🚀 ~ imports ~ imports:', imports);

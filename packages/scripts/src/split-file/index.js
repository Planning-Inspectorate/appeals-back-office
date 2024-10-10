import { Cursor } from './cursor.js';
import { getCodeSections } from './get-code-sections.js';
import { writeFiles } from './write-files.js';
import { getPaths } from './get-paths.js';

const { writeDirPath, originalFilePath } = getPaths();

const codeSections = getCodeSections(new Cursor(originalFilePath));

writeFiles(codeSections, writeDirPath);

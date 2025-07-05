import { formatList } from './format-list.js';

export function formatDocumentData(documentData, fallback = 'No documents') {
	const list = documentData?.documents.map((document) => document.name || 'Unnamed document') || [];
	return formatList(list, fallback);
}

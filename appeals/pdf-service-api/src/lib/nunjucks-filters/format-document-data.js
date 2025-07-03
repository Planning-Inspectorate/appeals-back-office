import { formatBulletedList } from './format-bulleted-list.js';

export function formatDocumentData(documentData, fallback = 'No documents') {
	const list = documentData?.documents.map((document) => document.name || 'Unnamed document') || [];
	switch (list.length) {
		case 0:
			return fallback;
		case 1:
			return list[0];
		default:
			return formatBulletedList(list);
	}
}

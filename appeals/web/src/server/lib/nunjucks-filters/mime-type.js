/** @type {Record<string, string>} */
const MIMEs = {
	pdf: 'application/pdf',
	doc: 'application/msword',
	docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	ppt: 'application/vnd.ms-powerpoint',
	pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
	xls: 'application/vnd.ms-excel',
	xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	msg: 'application/vnd.ms-outlook',
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
	mpeg: 'video/mpeg',
	mp3: 'audio/mpeg',
	mp4: 'video/mp4',
	mov: 'video/quicktime',
	png: 'image/png',
	tiff: 'image/tiff',
	tif: 'image/tiff'
};

/**
 * Returns MIME type from extension
 *
 * @param {string} extension
 * @returns {string}
 */
export const MIME = (extension) => {
	return MIMEs[extension] ? MIMEs[extension] : '';
};

/**
 * Returns a list of mime types
 *
 * @param {string[]} extensions
 * @returns {string}
 */
export const allowedMimeTypes = (extensions) => {
	return extensions?.map((extension) => MIME(extension)).join(',') || '';
};

/**
 * Returns a string of formatted file types
 *
 * @param {string[]} extensions
 * @returns {string}
 */
export const formattedFileTypes = (extensions) => {
	const fileTypeList =
		extensions?.map((extension) => MIME(extension) && extension.toUpperCase()) || [];
	if (fileTypeList.length > 1) {
		const last = fileTypeList.pop();
		return `${fileTypeList.join(', ')} or ${last}`;
	}
	return fileTypeList.join('');
};

/**
 * Returns extension from MIME type
 *
 * @param {string} mime
 * @returns {string | null}
 */
export const fileType = (mime) => {
	const MIMEList = Object.values(MIMEs);
	const mimeIndex = MIMEList.indexOf(mime);

	return Object.keys(MIMEs)[mimeIndex] ?? null;
};

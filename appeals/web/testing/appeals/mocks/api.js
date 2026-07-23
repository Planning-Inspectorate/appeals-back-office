import nock from 'nock';
import { appealData, appealsNationalList, caseNotes } from '../../app/fixtures/referencedata.js';

/**
 * @returns {{ destroy: () => void }}
 */
export function installMockAppealsService() {
	// national list
	nock('http://test/').get('/appeals/').reply(200, appealsNationalList).persist();

	// appeal details (matches any query params including include=all, include=specific, or none)
	nock('http://test/')
		.get(`/appeals/${appealData.appealId}`)
		.query(true)
		.reply(200, appealData)
		.persist();

	// appeal details page (optimized endpoint for the main appeal details page)
	nock('http://test/')
		.get(`/appeals/${appealData.appealId}/page-details`)
		.reply(200, appealData)
		.persist();

	// appeal exists check (for checkAppealExists / validateAppealExists middleware)
	nock('http://test/')
		.get(`/appeals/${appealData.appealId}/exists`)
		.reply(200, { id: appealData.appealId })
		.persist();

	nock('http://test/').get('/appeals/0').reply(500).persist();
	nock('http://test/').get('/appeals/0/exists').reply(404).persist();

	nock('http://test/')
		.get(`/appeals/${appealData.appealId}/case-notes`)
		.reply(200, caseNotes)
		.persist();

	return {
		destroy: () => {
			nock.cleanAll();
		}
	};
}

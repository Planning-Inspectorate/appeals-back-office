import nock from 'nock';
import { appealData, appealsNationalList, caseNotes } from '../../app/fixtures/referencedata.js';

/**
 * @returns {{ destroy: () => void }}
 */
export function installMockAppealsService() {
	// national list
	nock('http://test/').get('/appeals/').reply(200, appealsNationalList).persist();

	// appeal details
	nock('http://test/').get(`/appeals/${appealData.appealId}`).reply(200, appealData).persist();

	nock('http://test/').get('/appeals/0').reply(500).persist();

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

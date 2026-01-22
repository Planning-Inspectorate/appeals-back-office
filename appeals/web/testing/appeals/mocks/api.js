import nock from 'nock';
import { appealData, appealsNationalList, caseNotes } from '../../app/fixtures/referencedata.js';

/**
 * @returns {{ destroy: () => void }}
 */
export function installMockAppealsService() {
	// national list
	nock('http://test/').get('/appeals/').reply(200, appealsNationalList).persist();

	// appeal details
	nock('http://test/')
		.get(`/appeals/${appealData.appealId}?include=all`)
		.reply(200, appealData)
		.persist();

	// appeal details with appellant case
	nock('http://test/')
		.get(`/appeals/${appealData.appealId}?include=appellantCase`)
		.reply(200, appealData)
		.persist();

	// appeal details with appellant case and appeal grounds
	nock('http://test/')
		.get(`/appeals/${appealData.appealId}?include=appellantCase,appealGrounds`)
		.reply(200, appealData)
		.persist();

	nock('http://test/').get('/appeals/0').reply(500).persist();

	nock('http://test/')
		.get(`/appeals/${appealData.appealId}/case-notes`)
		.reply(200, caseNotes)
		.persist();

	nock('https://www.gov.uk')
		.get(`/bank-holidays.json`)
		.reply(200, {
			'england-and-wales': {
				division: 'england-and-wales',
				events: [{ title: 'New Year’s Day', date: '2019-01-01', notes: '', bunting: true }]
			}
		})
		.persist();

	return {
		destroy: () => {
			nock.cleanAll();
		}
	};
}

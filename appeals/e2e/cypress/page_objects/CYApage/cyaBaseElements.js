import { CaseDetailsPage } from '../caseDetailsPage';

export class CyaBaseElements extends CaseDetailsPage {
	Elements = {
		//Subheadings
		POEsubheading: 'Proof of evidence and witnesses',
		ReviewDecisions: 'Review decisions',

		//Reject subheading content elements
		rejectReasonSubheading: 'Reason for rejecting the ',
		rejectCaption:
			'We’ll send an email to the appellant to explain why you rejected their proof of evidence and witnesses',

		//Buttons
		submitRejectButton: 'Confirm statement is incomplete',
		submitAcceptButton: 'Accept',

		//Accept and reject content elements
		acceptTextContent: 'Accept proof of evidence and witnesses',
		rejectTextContent: 'Reject proof of evidence and witnesses',
		reasonTextSupportingDocTextContent: 'Supporting documents missing',
		reasonTextOtherTextContent: 'Other:'
	};
}

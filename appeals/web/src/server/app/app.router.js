import config from '#environment/config.js';
import { assertGroupAccess } from './auth/auth.guards.js';
import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import authRouter from './auth/auth.router.js';
import appealsRouter from '../appeals/appeals.router.js';
import { installAuthMock } from '#testing/app/mocks/auth.js';
import {
	handleHeathCheck,
	handleHeadHealthCheck,
	viewHomepage,
	viewUnauthenticatedError
} from './app.controller.js';
import { handleSignout } from './auth/auth.controller.js';
import { assertIsAuthenticated } from './auth/auth.guards.js';
import {
	getDocumentDownload,
	getDocumentDownloadByVersion
} from './components/file-downloader.component.js';
import { addApiClientToRequest } from '../lib/middleware/add-apiclient-to-request.js';

const router = createRouter();

// In development only, integrate with locally defined user groups

if (config.authDisabled) {
	router.use(installAuthMock({ groups: config.authDisabledGroupIds }));
}

router.use(authRouter);

// Unauthenticated routes

router.route('/').head(handleHeadHealthCheck); // used by Front Door health check
router.route('/unauthenticated').get(viewUnauthenticatedError);
router.route('/health').get(handleHeathCheck);

// Authenticated routes

if (!config.authDisabled) {
	router.use(assertIsAuthenticated);
}

// assert membership to one of the required groups to get to any page
// this only excludes the unauthenticated routes above, such as login
// note this also works locally, as the session is mocked
//
// specific routes should still add a group access guard where required for specific RBAC

const allowedGroups = config.referenceData.appeals;
const groupIds = [
	allowedGroups.caseOfficerGroupId,
	allowedGroups.inspectorGroupId,
	allowedGroups.customerServiceGroupId,
	allowedGroups.legalGroupId,
	allowedGroups.padsGroupId,
	allowedGroups.readerGroupId
];

router.use(assertGroupAccess(...groupIds));

router.route('/').get(viewHomepage);
router.route('/auth/signout').get(handleSignout);

router
	.route('/documents/:caseId/download/:guid/:preview?')
	.get(addApiClientToRequest, asyncHandler(getDocumentDownload));

router
	.route('/documents/:caseId/download/:guid/:version/:preview?')
	.get(addApiClientToRequest, asyncHandler(getDocumentDownloadByVersion));

router.use('/appeals-service', addApiClientToRequest, appealsRouter);

export default router;

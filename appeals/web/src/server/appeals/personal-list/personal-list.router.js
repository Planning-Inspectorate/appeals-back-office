import { assertUserHasPermission } from '#app/auth/auth.guards.js';
import searchCaseOfficerRouter from '#appeals/personal-list/search-case-officer/search-case-officer.router.js';
import { permissionNames } from '#environment/permissions.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controller from './personal-list.controller.js';

const router = createRouter();

router.route('/').get(asyncHandler(controller.viewPersonalList));

router.use(
	'/search-case-officer',
	assertUserHasPermission(permissionNames.viewCaseList),
	searchCaseOfficerRouter
);

export default router;

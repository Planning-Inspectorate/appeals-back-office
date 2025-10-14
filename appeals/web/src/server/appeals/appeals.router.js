import { assertUserHasPermission } from '#app/auth/auth.guards.js';
import searchCaseOfficerRouter from '#appeals/search-case-officer/search-case-officer.router.js';
import { permissionNames } from '#environment/permissions.js';
import { Router as createRouter } from 'express';
import nationalListRouter from '../appeals/national-list/national-list.router.js';
import personalListRouter from '../appeals/personal-list/personal-list.router.js';
import appealDetailsRouter from './appeal-details/appeal-details.router.js';
import errorRouter from './error/error.router.js';

const router = createRouter();

router.use('/all-cases', assertUserHasPermission(permissionNames.viewCaseList), nationalListRouter);

router.use('/personal-list', personalListRouter);

router.use('/appeal-details', appealDetailsRouter);

router.use(
	'/search-case-officer',
	assertUserHasPermission(permissionNames.viewCaseList),
	searchCaseOfficerRouter
);

router.use('/error', errorRouter);

export default router;

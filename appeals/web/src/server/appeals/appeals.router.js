import { Router as createRouter } from 'express';
import nationalListRouter from '../appeals/national-list/national-list.router.js';
import personalListRouter from '../appeals/personal-list/personal-list.router.js';
import appealDetailsRouter from './appeal-details/appeal-details.router.js';
import { assertUserHasPermission } from '#app/auth/auth.guards.js';
import { permissionNames } from '#environment/permissions.js';

const router = createRouter();

router.use('/all-cases', assertUserHasPermission(permissionNames.viewCaseList), nationalListRouter);

router.use('/personal-list', personalListRouter);

router.use('/appeal-details', appealDetailsRouter);

export default router;

import { eslintConfig } from '@planning-inspectorate/coding-standards';
import jestPlugin from 'eslint-plugin-jest';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';

export default defineConfig([
	...eslintConfig,
	globalIgnores([
		'**/*.min*.js',
		'**/static/scripts/app.js',
		'appeals/e2e/**/*.js',
		'appeals/api/src/server/utils/db-client/*'
	]),
	{
		files: ['**/*.d.ts'],
		rules: {
			// allow imports for types in d.ts files
			'@typescript-eslint/consistent-type-imports': 'off',
			// allow 'renaming' types with an empty extends
			'@typescript-eslint/no-empty-object-type': 'off'
		}
	},
	{
		files: ['**/*.test.js'],
		plugins: { jest: jestPlugin },
		languageOptions: {
			globals: jestPlugin.environments.globals.globals
		}
	},
	{
		files: ['appeals/web/src/client/**', 'appeals/web/testing/app/mocks/client-side.js'],
		languageOptions: {
			globals: globals.browser
		}
	},
	{
		rules: {
			'no-restricted-syntax': [
				'error',
				{
					selector: "Property[key.name='include']",
					message:
						'use prisma select instead \nif this is not a prisma property comment /* eslint-disable no-restricted-syntax */'
				}
			]
		}
	},
	{
		files: [
			'appeals/api/src/database/seed/data-test.js',
			'appeals/api/src/server/endpoints/Inquiry/__tests__/inquiry.test.js',
			'appeals/api/src/server/endpoints/appeal-details/__tests__/appeals-details.test.js',
			'appeals/api/src/server/endpoints/appeal-timetables/__tests__/appeal-timetables.test.js',
			'appeals/api/src/server/endpoints/appeals/__tests__/appeals.test.js',
			'appeals/api/src/server/endpoints/appellant-cases/__tests__/appellant-cases.test.js',
			'appeals/api/src/server/endpoints/change-appeal-type/__tests__/change-appeal-type.test.js',
			'appeals/api/src/server/endpoints/change-procedure-type/change-procedure-type.service.js',
			'appeals/api/src/server/endpoints/hearings/__tests__/hearing.test.js',
			'appeals/api/src/server/endpoints/integrations/__tests__/integrations.test.js',
			'appeals/api/src/server/endpoints/integrations/integrations.broadcasters/appeal.js',
			'appeals/api/src/server/endpoints/integrations/integrations.broadcasters/documents.js',
			'appeals/api/src/server/endpoints/integrations/integrations.broadcasters/event-estimates.js',
			'appeals/api/src/server/endpoints/integrations/integrations.broadcasters/event.js',
			'appeals/api/src/server/endpoints/integrations/integrations.broadcasters/representation.js',
			'appeals/api/src/server/endpoints/integrations/integrations.broadcasters/service-users.js',
			'appeals/api/src/server/endpoints/integrations/integrations.middleware.js',
			'appeals/api/src/server/endpoints/neighbouring-sites/__tests__/neighbouring-sites.test.js',
			'appeals/api/src/server/endpoints/test-utils/test-utils.controller.js',
			'appeals/api/src/server/repositories/appeal-lists.repository.js',
			'appeals/api/src/server/repositories/appeal.repository.js',
			'appeals/api/src/server/repositories/appeal-timetable.repository.js',
			'appeals/api/src/server/repositories/audit-trail.repository.js',
			'appeals/api/src/server/repositories/case-notes.repository.js',
			'appeals/api/src/server/repositories/document-metadata.repository.js',
			'appeals/api/src/server/repositories/document.repository.js',
			'appeals/api/src/server/repositories/folder.repository.js',
			'appeals/api/src/server/repositories/hearing.repository.js',
			'appeals/api/src/server/repositories/inquiry.repository.js',
			'appeals/api/src/server/repositories/neighbouring-sites.repository.js',
			'appeals/api/src/server/repositories/personal-list.repository.js',
			'appeals/api/src/server/repositories/representation.repository.js',
			'appeals/api/src/server/repositories/site-visit.repository.js'
		],
		rules: {
			'no-restricted-syntax': [
				'warn',
				{
					selector: "Property[key.name='include']",
					message:
						'use prisma select instead \nif this is not a prisma property comment /* eslint-disable no-restricted-syntax */'
				}
			]
		}
	},
	{
		files: [
			// allow these special folder names
			'appeals/api/src/database/seed/{LPAs,PADs}/**/*.{ts,js}',
			// allow these existing non-compliant names
			'appeals/api/src/server/endpoints/Inquiry/**/*.{ts,js}',
			'appeals/api/src/server/endpoints/integrations/integrations.broadcasters/**/*.{ts,js}'
		],
		rules: {
			'check-file/folder-naming-convention': 'off'
		}
	},
	{
		files: [
			// allow files starting _
			'**/_*.js',
			// allow these existing non-compliant names
			'appeals/api/src/server/tests/appeals/timetableMocks.js',
			'appeals/web/src/server/lib/resolveAppealId.js',
			'appeals/web/testing/lib/testMappers.js'
		],
		rules: {
			'check-file/filename-naming-convention': 'off'
		}
	}
]);

/**
 * @typedef ForeignKeys
 * @type {Object}
 * @property {string} constraint_name
 * @property {string} schema_name
 * @property {string} table_name
 * @property {string} column_name
 * @property {string} referenced_schema
 * @property {string} referenced_table
 * @property {string[]} referenced_column
 * @property {string} on_delete
 * @property {string} on_update
 * @property {string[]} columns
 * @property {string[]} referenced_columns
 */

/**
 * @typedef onDeleteOrOnUpdateMap
 * @type {Record<string, string>}
 */

/**
 * @param {import('../../server/utils/db-client/client.ts').PrismaClient} databaseConnector
 * @returns {Promise<Array<ForeignKeys>>}
 * @throws {Error}
 */
async function getAllForeignKeys(databaseConnector) {
	try {
		/**
		 *  @type {Array<ForeignKeys>}
		 */
		const foreignKeys = await databaseConnector.$queryRawUnsafe(`
			WITH ForeignKeyInfo AS (
				SELECT
					fk.name AS constraint_name,
					fk.parent_object_id,
					fk.referenced_object_id,
					fkc.parent_column_id,
					fkc.referenced_column_id,
					fkc.constraint_column_id,
					fk.delete_referential_action,
					fk.update_referential_action
				FROM sys.foreign_keys AS fk
				INNER JOIN sys.foreign_key_columns AS fkc
					ON fk.object_id = fkc.constraint_object_id
			)

			SELECT
			-- Basic identification
			f.constraint_name,
			OBJECT_SCHEMA_NAME(f.parent_object_id) AS schema_name,
			OBJECT_NAME(f.parent_object_id) AS table_name,

			-- Column in the table that has the FK
			COL_NAME(f.parent_object_id, f.parent_column_id) AS column_name,

			-- Referenced (parent) table and column
			OBJECT_SCHEMA_NAME(f.referenced_object_id) AS referenced_schema,
			OBJECT_NAME(f.referenced_object_id) AS referenced_table,
			COL_NAME(f.referenced_object_id, f.referenced_column_id) AS referenced_column,

			-- On delete/update actions
			CASE f.delete_referential_action
				WHEN 0 THEN 'NO ACTION'
				WHEN 1 THEN 'CASCADE'
				WHEN 2 THEN 'SET NULL'
				WHEN 3 THEN 'SET DEFAULT'
			END AS on_delete,

			CASE f.update_referential_action
				WHEN 0 THEN 'NO ACTION'
				WHEN 1 THEN 'CASCADE'
				WHEN 2 THEN 'SET NULL'
				WHEN 3 THEN 'SET DEFAULT'
			END AS on_update,

			-- Column order within FK (useful for composite keys)
			f.constraint_column_id AS column_order

			FROM ForeignKeyInfo AS f
			WHERE OBJECT_SCHEMA_NAME(f.parent_object_id) NOT IN ('sys')
			ORDER BY
			OBJECT_SCHEMA_NAME(f.parent_object_id),
			OBJECT_NAME(f.parent_object_id),
			f.constraint_name,
			f.constraint_column_id;
			`);

		console.info(`Query returned ${foreignKeys.length} foreign key columns`);

		// Group by constraint name to handle multi-column FKs
		const foreignKeyMap = new Map();

		for (const foreignKey of foreignKeys) {
			if (!foreignKeyMap.has(foreignKey.constraint_name)) {
				foreignKeyMap.set(foreignKey.constraint_name, {
					constraint_name: foreignKey.constraint_name,
					schema_name: foreignKey.schema_name,
					table_name: foreignKey.table_name,
					referenced_schema: foreignKey.referenced_schema,
					referenced_table: foreignKey.referenced_table,
					on_delete: foreignKey.on_delete,
					on_update: foreignKey.on_update,
					columns: [],
					referenced_columns: []
				});
			}

			const foreignKeyConstraint = foreignKeyMap.get(foreignKey.constraint_name);
			foreignKeyConstraint.columns.push(foreignKey.column_name);
			foreignKeyConstraint.referenced_columns.push(foreignKey.referenced_column);
		}

		const foreignKeyArray = Array.from(foreignKeyMap.values());
		console.info(`Grouped into ${foreignKeyArray.length} foreign key constraints\n`);

		return foreignKeyArray;
	} catch (error) {
		console.error('Error querying foreign keys:', error);
		throw error;
	}
}

/**
 * @typedef {{seedIndex: number, increment: number, currentIndex: number}} IndexInfo
 */

/**
 * @param {import('../../server/utils/db-client/client.ts').PrismaClient} databaseConnector
 * @param {string} schemaName
 * @param {string} tableName
 * @returns {Promise<IndexInfo>}
 */
async function getTableIndexes(databaseConnector, schemaName, tableName) {
	console.info(`Fetching indexes for table ${schemaName}.${tableName}...`);

	const indexInfoStatement = `
		SELECT 
  			IDENT_SEED('${schemaName}.${tableName}') AS seedIndex,
  			IDENT_INCR('${schemaName}.${tableName}') AS increment,
  			IDENT_CURRENT('${schemaName}.${tableName}') AS currentIndex;
	`;

	console.info(indexInfoStatement);
	/**
	 * @type {Array<IndexInfo>}
	 */
	const indexInfo = await databaseConnector.$queryRawUnsafe(indexInfoStatement);

	console.info(`Found ${JSON.stringify(indexInfo)} indexes on table ${schemaName}.${tableName}\n`);

	return indexInfo[0];
}

/**
 * @param {import('../../server/utils/db-client/client.ts').PrismaClient} databaseConnector
 * @param {string} schemaName
 * @param {string} tableName
 * @param {number} currentIndex
 */
async function resetTableIndex(databaseConnector, schemaName, tableName, currentIndex) {
	const newIndex = currentIndex + 1;

	console.info(`Old index was ${currentIndex} for table ${schemaName}.${tableName}...`);

	const resetIndexStatement = `DBCC CHECKIDENT ('${schemaName}.${tableName}', RESEED, ${newIndex})`;
	await databaseConnector.$executeRawUnsafe(resetIndexStatement);

	console.info(`Index set to ${newIndex} on table ${schemaName}.${tableName}\n`);
}

/**
 * @param {import('../../server/utils/db-client/client.ts').PrismaClient} databaseConnector
 */
async function dropAllForeignKeys(databaseConnector) {
	console.info('Fetching all foreign keys...');
	const foreignKeys = await getAllForeignKeys(databaseConnector);

	for (const foreignKey of foreignKeys) {
		const dropStatement = `
      		ALTER TABLE [${foreignKey.schema_name}].[${foreignKey.table_name}] 
      		DROP CONSTRAINT [${foreignKey.constraint_name}]
    	`;
		await databaseConnector.$executeRawUnsafe(dropStatement);
	}

	console.info('All foreign keys dropped successfully\n');
	return foreignKeys;
}

/**
 * @param {Array<ForeignKeys>} foreignKeys
 * @param {import('../../server/utils/db-client/client.ts').PrismaClient} databaseConnector
 */
async function recreateForeignKeys(foreignKeys, databaseConnector) {
	console.info(`Recreating ${foreignKeys.length} foreign key constraints...`);

	const failedStatements = [];

	for (const foreignKey of foreignKeys) {
		// Map to SQL Server syntax
		/**
		 * @type {onDeleteOrOnUpdateMap}
		 */
		const onDeleteMap = {
			CASCADE: 'ON DELETE CASCADE',
			'SET NULL': 'ON DELETE SET NULL',
			'SET DEFAULT': 'ON DELETE SET DEFAULT',
			'NO ACTION': ''
		};
		/**
		 * @type {onDeleteOrOnUpdateMap}
		 */
		const onUpdateMap = {
			CASCADE: 'ON UPDATE CASCADE',
			'SET NULL': 'ON UPDATE SET NULL',
			'SET DEFAULT': 'ON UPDATE SET DEFAULT',
			'NO ACTION': ''
		};

		const onDelete = onDeleteMap[foreignKey.on_delete] || '';
		const onUpdate = onUpdateMap[foreignKey.on_update] || '';

		// Handle multi-column foreign keys
		const columns = foreignKey.columns.map((col) => `[${col}]`).join(', ');
		const refColumns = foreignKey.referenced_columns.map((col) => `[${col}]`).join(', ');

		const createStatement = `
      		ALTER TABLE [${foreignKey.schema_name}].[${foreignKey.table_name}]
      		ADD CONSTRAINT [${foreignKey.constraint_name}]
      		FOREIGN KEY (${columns})
      		REFERENCES [${foreignKey.referenced_schema}].[${foreignKey.referenced_table}] (${refColumns})${onDelete} ${onUpdate}`.trim();

		try {
			await databaseConnector.$executeRawUnsafe(createStatement);
		} catch (/** @type {any} */ error) {
			console.error(`Failed to recreate FK ${foreignKey.constraint_name}: ${error.message}`);
			failedStatements.push({
				constraintName: foreignKey.constraint_name,
				statement: createStatement,
				error: error.message
			});
		}
	}

	// Log all failed statements at the end
	if (failedStatements.length > 0) {
		console.info('\n========== FAILED FOREIGN KEY RECREATIONS ==========');
		console.info(
			`${failedStatements.length} foreign key(s) failed to recreate. Run these statements manually:\n`
		);

		failedStatements.forEach(({ constraintName, statement, error }) => {
			console.info(`-- FK: ${constraintName}`);
			console.info(`-- Error: ${error}`);
			console.info(statement);
			console.info('');
		});

		console.info('===============================================================\n');
	} else {
		console.info('All foreign keys recreated successfully\n');
	}
}
/**
 * @param {import('../../server/utils/db-client/client.ts').PrismaClient} databaseConnector
 */
async function truncateAllTables(databaseConnector) {
	console.info('Fetching all tables...');

	/**
	 * @typedef {{TABLE_SCHEMA: string, TABLE_NAME: string}} TableInfo
	 * @type {Array<TableInfo>}
	 */
	const tables = await databaseConnector.$queryRawUnsafe(`
		SELECT 
		TABLE_SCHEMA,
		TABLE_NAME
		FROM INFORMATION_SCHEMA.TABLES
		WHERE TABLE_TYPE = 'BASE TABLE'
		AND TABLE_SCHEMA NOT IN ('sys', 'INFORMATION_SCHEMA')
		AND TABLE_NAME != '_prisma_migrations'
		ORDER BY TABLE_SCHEMA, TABLE_NAME
	`);

	console.info(`Found ${tables.length} tables to truncate`);

	for (const table of tables) {
		const truncateStatement = `TRUNCATE TABLE [${table.TABLE_SCHEMA}].[${table.TABLE_NAME}]`;
		const deleteStatement = `DELETE FROM [${table.TABLE_SCHEMA}].[${table.TABLE_NAME}]`;

		try {
			await databaseConnector.$executeRawUnsafe(truncateStatement);
		} catch (/** @type {any} */ truncateError) {
			console.warn(
				`TRUNCATE failed for ${table.TABLE_SCHEMA}.${table.TABLE_NAME}: ${truncateError.message}. Attempting DELETE...`
			);

			try {
				await databaseConnector.$executeRawUnsafe(deleteStatement);
				console.info(`Successfully deleted data from ${table.TABLE_SCHEMA}.${table.TABLE_NAME}`);
			} catch (/** @type {any} */ deleteError) {
				console.error(
					`DELETE also failed for ${table.TABLE_SCHEMA}.${table.TABLE_NAME}: ${deleteError.message}`
				);
			}
		}
	}

	console.info('Table truncation complete\n');
}

/**
 * @param {import('../../server/utils/db-client/client.ts').PrismaClient} databaseConnector
 */
export async function deleteExistingData(databaseConnector) {
	try {
		const appealndexInfo = await getTableIndexes(databaseConnector, 'dbo', 'Appeal');
		const serviceUserIndexInfo = await getTableIndexes(databaseConnector, 'dbo', 'ServiceUser');
		const initialForeignKeys = await dropAllForeignKeys(databaseConnector);

		await truncateAllTables(databaseConnector);
		await recreateForeignKeys(initialForeignKeys, databaseConnector);

		const recreatedForeignKeys = await getAllForeignKeys(databaseConnector);
		await resetTableIndex(databaseConnector, 'dbo', 'Appeal', Number(appealndexInfo.currentIndex));
		await resetTableIndex(
			databaseConnector,
			'dbo',
			'ServiceUser',
			Number(serviceUserIndexInfo.currentIndex)
		);

		if (
			JSON.stringify(initialForeignKeys).localeCompare(JSON.stringify(recreatedForeignKeys)) !== 0
		) {
			throw new Error('Foreign keys before and after do not match!');
		}

		console.info('✅ All data deleted!\n');
	} catch (error) {
		console.error('❌ Error during delete:', error, '\n');
		throw error;
	}
}

BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[AppellantCaseIncompleteReasonsSelected] DROP CONSTRAINT [AppellantCaseIncompleteReasonsSelected_appellantCaseIncompleteReasonId_fkey];

-- RedefineTables
BEGIN TRANSACTION;
ALTER TABLE [dbo].[AppellantCaseIncompleteReason] DROP CONSTRAINT [AppellantCaseIncompleteReason_name_key];
DECLARE @SQL NVARCHAR(MAX) = N''
SELECT @SQL += N'ALTER TABLE '
    + QUOTENAME(OBJECT_SCHEMA_NAME(PARENT_OBJECT_ID))
    + '.'
    + QUOTENAME(OBJECT_NAME(PARENT_OBJECT_ID))
    + ' DROP CONSTRAINT '
    + OBJECT_NAME(OBJECT_ID) + ';'
FROM SYS.OBJECTS
WHERE TYPE_DESC LIKE '%CONSTRAINT'
    AND OBJECT_NAME(PARENT_OBJECT_ID) = 'AppellantCaseIncompleteReason'
    AND SCHEMA_NAME(SCHEMA_ID) = 'dbo'
EXEC sp_executesql @SQL
;
CREATE TABLE [dbo].[_prisma_new_AppellantCaseIncompleteReason] (
    [id] INT NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [hasText] BIT NOT NULL CONSTRAINT [AppellantCaseIncompleteReason_hasText_df] DEFAULT 0,
    CONSTRAINT [AppellantCaseIncompleteReason_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [AppellantCaseIncompleteReason_name_key] UNIQUE NONCLUSTERED ([name])
);
IF EXISTS(SELECT * FROM [dbo].[AppellantCaseIncompleteReason])
    EXEC('INSERT INTO [dbo].[_prisma_new_AppellantCaseIncompleteReason] ([hasText],[id],[name]) SELECT [hasText],[id],[name] FROM [dbo].[AppellantCaseIncompleteReason] WITH (holdlock tablockx)');
DROP TABLE [dbo].[AppellantCaseIncompleteReason];
EXEC SP_RENAME N'dbo._prisma_new_AppellantCaseIncompleteReason', N'AppellantCaseIncompleteReason';
COMMIT;

-- AddForeignKey
ALTER TABLE [dbo].[AppellantCaseIncompleteReasonsSelected] ADD CONSTRAINT [AppellantCaseIncompleteReasonsSelected_appellantCaseIncompleteReasonId_fkey] FOREIGN KEY ([appellantCaseIncompleteReasonId]) REFERENCES [dbo].[AppellantCaseIncompleteReason]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

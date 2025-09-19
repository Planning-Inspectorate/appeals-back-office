BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[AppellantCaseInvalidReasonsSelected] DROP CONSTRAINT [AppellantCaseInvalidReasonsSelected_appellantCaseInvalidReasonId_fkey];

-- RedefineTables
BEGIN TRANSACTION;
ALTER TABLE [dbo].[AppellantCaseInvalidReason] DROP CONSTRAINT [AppellantCaseInvalidReason_name_key];
DECLARE @SQL NVARCHAR(MAX) = N''
SELECT @SQL += N'ALTER TABLE '
    + QUOTENAME(OBJECT_SCHEMA_NAME(PARENT_OBJECT_ID))
    + '.'
    + QUOTENAME(OBJECT_NAME(PARENT_OBJECT_ID))
    + ' DROP CONSTRAINT '
    + OBJECT_NAME(OBJECT_ID) + ';'
FROM SYS.OBJECTS
WHERE TYPE_DESC LIKE '%CONSTRAINT'
    AND OBJECT_NAME(PARENT_OBJECT_ID) = 'AppellantCaseInvalidReason'
    AND SCHEMA_NAME(SCHEMA_ID) = 'dbo'
EXEC sp_executesql @SQL
;
CREATE TABLE [dbo].[_prisma_new_AppellantCaseInvalidReason] (
    [id] INT NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [hasText] BIT NOT NULL CONSTRAINT [AppellantCaseInvalidReason_hasText_df] DEFAULT 0,
    CONSTRAINT [AppellantCaseInvalidReason_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [AppellantCaseInvalidReason_name_key] UNIQUE NONCLUSTERED ([name])
);
IF EXISTS(SELECT * FROM [dbo].[AppellantCaseInvalidReason])
    EXEC('INSERT INTO [dbo].[_prisma_new_AppellantCaseInvalidReason] ([hasText],[id],[name]) SELECT [hasText],[id],[name] FROM [dbo].[AppellantCaseInvalidReason] WITH (holdlock tablockx)');
DROP TABLE [dbo].[AppellantCaseInvalidReason];
EXEC SP_RENAME N'dbo._prisma_new_AppellantCaseInvalidReason', N'AppellantCaseInvalidReason';
COMMIT;

-- AddForeignKey
ALTER TABLE [dbo].[AppellantCaseInvalidReasonsSelected] ADD CONSTRAINT [AppellantCaseInvalidReasonsSelected_appellantCaseInvalidReasonId_fkey] FOREIGN KEY ([appellantCaseInvalidReasonId]) REFERENCES [dbo].[AppellantCaseInvalidReason]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

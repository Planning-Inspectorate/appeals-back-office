BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[RepresentationRejectionReasonsSelected] DROP CONSTRAINT [RepresentationRejectionReasonsSelected_representationRejectionReasonId_fkey];

-- RedefineTables
BEGIN TRANSACTION;
ALTER TABLE [dbo].[RepresentationRejectionReason] DROP CONSTRAINT [RepresentationRejectionReason_name_representationType_key];
DECLARE @SQL NVARCHAR(MAX) = N''
SELECT @SQL += N'ALTER TABLE '
    + QUOTENAME(OBJECT_SCHEMA_NAME(PARENT_OBJECT_ID))
    + '.'
    + QUOTENAME(OBJECT_NAME(PARENT_OBJECT_ID))
    + ' DROP CONSTRAINT '
    + OBJECT_NAME(OBJECT_ID) + ';'
FROM SYS.OBJECTS
WHERE TYPE_DESC LIKE '%CONSTRAINT'
    AND OBJECT_NAME(PARENT_OBJECT_ID) = 'RepresentationRejectionReason'
    AND SCHEMA_NAME(SCHEMA_ID) = 'dbo'
EXEC sp_executesql @SQL
;
CREATE TABLE [dbo].[_prisma_new_RepresentationRejectionReason] (
    [id] INT NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [hasText] BIT NOT NULL CONSTRAINT [RepresentationRejectionReason_hasText_df] DEFAULT 0,
    [representationType] NVARCHAR(1000) NOT NULL CONSTRAINT [RepresentationRejectionReason_representationType_df] DEFAULT 'comment',
    CONSTRAINT [RepresentationRejectionReason_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [RepresentationRejectionReason_name_representationType_key] UNIQUE NONCLUSTERED ([name],[representationType])
);
IF EXISTS(SELECT * FROM [dbo].[RepresentationRejectionReason])
    EXEC('INSERT INTO [dbo].[_prisma_new_RepresentationRejectionReason] ([hasText],[id],[name],[representationType]) SELECT [hasText],[id],[name],[representationType] FROM [dbo].[RepresentationRejectionReason] WITH (holdlock tablockx)');
DROP TABLE [dbo].[RepresentationRejectionReason];
EXEC SP_RENAME N'dbo._prisma_new_RepresentationRejectionReason', N'RepresentationRejectionReason';
COMMIT;

-- AddForeignKey
ALTER TABLE [dbo].[RepresentationRejectionReasonsSelected] ADD CONSTRAINT [RepresentationRejectionReasonsSelected_representationRejectionReasonId_fkey] FOREIGN KEY ([representationRejectionReasonId]) REFERENCES [dbo].[RepresentationRejectionReason]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

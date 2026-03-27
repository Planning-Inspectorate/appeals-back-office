/*
  Warnings:

  - A unique constraint covering the columns `[appealType,groundRef]` on the table `Ground` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `appealType` to the `Ground` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- DropIndex
ALTER TABLE [dbo].[Ground] DROP CONSTRAINT [Ground_groundRef_key];

-- AlterTable - default was manually added
ALTER TABLE [dbo].[Ground] ADD [appealType] NVARCHAR(1000) NOT NULL DEFAULT 'Enforcement notice appeal';

-- Removes the manually added default above
DECLARE @default_name SYSNAME;
SELECT @default_name = name 
FROM sys.default_constraints 
WHERE parent_object_id = OBJECT_ID('[dbo].[Ground]') 
AND col_name(parent_object_id, parent_column_id) = 'appealType';
IF @default_name IS NOT NULL
    EXEC('ALTER TABLE [dbo].[Ground] DROP CONSTRAINT ' + @default_name);

-- CreateIndex
ALTER TABLE [dbo].[Ground] ADD CONSTRAINT [Ground_appealType_groundRef_key] UNIQUE NONCLUSTERED ([appealType], [groundRef]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

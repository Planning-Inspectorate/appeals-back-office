/*
  Warnings:

  - You are about to drop the `OtherAppellant` table. If the table is not empty, all the data it contains will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[OtherAppellant] DROP CONSTRAINT [OtherAppellant_appealId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[OtherAppellant] DROP CONSTRAINT [OtherAppellant_appellantId_fkey];

-- DropTable
DROP TABLE [dbo].[OtherAppellant];

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

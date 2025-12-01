BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[AppellantCase] ADD [descriptionOfAllegedBreach] NVARCHAR(1000);

-- CreateTable
CREATE TABLE [dbo].[AppealGround] (
    [id] INT NOT NULL IDENTITY(1,1),
    [groundId] INT,
    [appealId] INT,
    [factsForGround] NVARCHAR(1000),
    CONSTRAINT [AppealGround_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [AppealGround_groundId_appealId_key] UNIQUE NONCLUSTERED ([groundId],[appealId])
);

-- CreateTable
CREATE TABLE [dbo].[Ground] (
    [id] INT NOT NULL IDENTITY(1,1),
    [groundRef] NVARCHAR(1000) NOT NULL,
    [groundDescription] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Ground_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Ground_groundRef_key] UNIQUE NONCLUSTERED ([groundRef])
);

-- AddForeignKey
ALTER TABLE [dbo].[AppealGround] ADD CONSTRAINT [AppealGround_groundId_fkey] FOREIGN KEY ([groundId]) REFERENCES [dbo].[Ground]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[AppealGround] ADD CONSTRAINT [AppealGround_appealId_fkey] FOREIGN KEY ([appealId]) REFERENCES [dbo].[Appeal]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

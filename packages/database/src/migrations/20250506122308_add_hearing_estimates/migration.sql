BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[HearingEstimate] (
    [id] INT NOT NULL IDENTITY(1,1),
    [appealId] INT NOT NULL,
    [preparationTime] DECIMAL(32,16),
    [sittingTime] DECIMAL(32,16),
    [reportingTime] DECIMAL(32,16),
    CONSTRAINT [HearingEstimate_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [HearingEstimate_appealId_key] UNIQUE NONCLUSTERED ([appealId])
);

-- AddForeignKey
ALTER TABLE [dbo].[HearingEstimate] ADD CONSTRAINT [HearingEstimate_appealId_fkey] FOREIGN KEY ([appealId]) REFERENCES [dbo].[Appeal]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

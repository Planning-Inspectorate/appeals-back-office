BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[AppellantCase] ADD [agriculturalHolding] BIT,
[appellantProcedurePreference] NVARCHAR(1000),
[caseworkReason] NVARCHAR(1000),
[designAccessStatementProvided] BIT,
[developmentType] NVARCHAR(1000),
[informedTenantsAgriculturalHolding] BIT,
[inquiryHowManyWitnesses] INT,
[jurisdiction] NVARCHAR(1000),
[newPlansDrawingsProvided] BIT,
[numberOfResidences] INT,
[otherTenantsAgriculturalHolding] BIT,
[ownershipCertificateSubmitted] BIT,
[planningObligation] BIT,
[siteGridReferenceEasting] NVARCHAR(1000),
[siteGridReferenceNorthing] NVARCHAR(1000),
[siteViewableFromRoad] BIT,
[statusPlanningObligation] NVARCHAR(1000),
[tenantAgriculturalHolding] BIT,
[updateDevelopmentDescriptionUploaded] BIT;

-- AlterTable
ALTER TABLE [dbo].[LPAQuestionnaire] ADD [affectsScheduledMonument] BIT,
[dateCostsReportDespatched] DATETIME2,
[dateNotRecoveredOrDerecovered] DATETIME2,
[dateRecovered] DATETIME2,
[designatedSitesNames] NVARCHAR(1000),
[eiaColumnTwoThreshold] BIT,
[eiaCompletedEnvironmentalStatement] BIT,
[eiaConsultedBodiesDetails] NVARCHAR(1000),
[eiaDevelopmentDescription] NVARCHAR(1000),
[eiaEnvironmentalImpactSchedule] NVARCHAR(1000),
[eiaRequiresEnvironmentalStatement] BIT,
[eiaScreeningOpinion] BIT,
[eiaSensitiveAreaDetails] NVARCHAR(1000),
[hasConsultationResponses] BIT,
[hasEmergingPlan] BIT,
[hasInfrastructureLevy] BIT,
[hasProtectedSpecies] BIT,
[hasStatutoryConsultees] BIT,
[hasSupplementaryPlanningDocs] BIT,
[hasTreePreservationOrder] BIT,
[importantInformation] NVARCHAR(1000),
[infrastructureLevyAdoptedDate] DATETIME2,
[infrastructureLevyExpectedDate] DATETIME2,
[inspectorNeedToEnterSite] BIT,
[isGypsyOrTravellerSite] BIT,
[isInfrastructureLevyFormallyAdopted] BIT,
[isPublicRightOfWay] BIT,
[lpaAddedWitnesses] BIT,
[lpaFinalCommentDetails] NVARCHAR(1000),
[lpaProcedurePreference] NVARCHAR(1000),
[lpaProcedurePreferenceDetails] NVARCHAR(1000),
[lpaProcedurePreferenceDuration] INT,
[originalCaseDecisionDate] DATETIME2,
[redeterminedIndicator] NVARCHAR(1000),
[siteNoticesSent] NVARCHAR(1000),
[siteWithinSSSI] BIT,
[targetDate] DATETIME2;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

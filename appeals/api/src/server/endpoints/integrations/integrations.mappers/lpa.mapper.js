// @ts-nocheck
// TODO: schemas (PINS data model)
// TODO: add local data model for LPA

export const mapLpaIn = (casedata) => {
	return {
		lpaCode: casedata.lpaCode
	};
};

export const mapLpaOut = (appeal) => {
	return {
		lpaCode: appeal.lpa.lpaCode
	};
};

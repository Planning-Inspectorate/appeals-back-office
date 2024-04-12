/** @typedef {import("@pins/express").ValidationErrors | undefined} Error*/
export const errorAddressLine1 = (/** @type {Error}*/ errors) => {
	return errors?.addressLine1
		? {
				text: 'Enter address line 1, typically the building and street'
		  }
		: undefined;
};

export const errorTown = (/** @type {Error}*/ errors) => {
	return errors?.town
		? {
				text: 'Enter town or city'
		  }
		: undefined;
};

export const errorPostcode = (/** @type {Error}*/ errors) => {
	return errors?.postCode
		? {
				text: 'Enter a valid postcode'
		  }
		: undefined;
};

export const errorFirstName = (/** @type {Error}*/ errors) => {
	return errors?.firstName
		? {
				text: 'Enter first name'
		  }
		: undefined;
};

export const errorLastName = (/** @type {Error}*/ errors) => {
	return errors?.lastName
		? {
				text: 'Enter last name'
		  }
		: undefined;
};

export const errorEmail = (/** @type {Error}*/ errors) => {
	return errors?.emailAddress
		? {
				text: 'Enter a valid email'
		  }
		: undefined;
};

export const errorEmailAllowEmpty = (/** @type {Error}*/ errors) => {
	return errors?.emailAddress
		? {
				text: 'Enter a valid email or leave empty'
		  }
		: undefined;
};

export const errorPlanningApplicationReference = (/** @type {Error}*/ errors) => {
	return errors?.planningApplicationReference
		? {
				text: 'Enter the planning application reference' //TODO: Check with content that this is the correct wording
		  }
		: undefined;
};

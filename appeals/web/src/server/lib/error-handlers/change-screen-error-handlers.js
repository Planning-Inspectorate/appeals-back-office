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
				text: 'Enter a full UK postcode'
		  }
		: undefined;
};

export const errorFirstName = (/** @type {Error}*/ errors) => {
	return errors?.firstName
		? {
				text: 'Enter a first name'
		  }
		: undefined;
};

export const errorLastName = (/** @type {Error}*/ errors) => {
	return errors?.lastName
		? {
				text: 'Enter a last name'
		  }
		: undefined;
};

export const errorOrganisationNameAllowEmpty = (/** @type {Error}*/ errors) => {
	return errors?.organisationName
		? {
				text: 'Enter an organisation or company name, or leave empty'
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

export const errorPhoneNumberAllowEmpty = (/** @type {Error}*/ errors) => {
	return errors?.phoneNumber
		? {
				text: 'Enter a valid phone number or leave empty'
		  }
		: undefined;
};

export const errorPlanningApplicationReference = (/** @type {Error}*/ errors) => {
	return errors?.planningApplicationReference
		? {
				text: errors.planningApplicationReference.msg
		  }
		: undefined;
};

export const errorInspectorAccessRadio = (/** @type {Error}*/ errors) => {
	return errors?.inspectorAccessRadio
		? {
				text: 'Select one option'
		  }
		: undefined;
};

export const errorAddressProvidedRadio = (/** @type {Error} */ errors) => {
	return errors?.addressProvided
		? {
				text: 'Select one option'
		  }
		: undefined;
};

export const getErrorByFieldname = (/** @type {Error} */ errors, /** @type {string} */ fieldName) =>
	errors?.[fieldName]?.msg ? { text: errors[fieldName].msg } : undefined;

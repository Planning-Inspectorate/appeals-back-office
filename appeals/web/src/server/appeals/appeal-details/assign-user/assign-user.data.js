export const assignEmailTemplate = {
	renderedHtml: [
		`<div class="pins-notify-preview-border">`,
		`<p>We have added the inspector John Smith to the appeal.</p>`,
		`<h3> Appeal details</h3>`,
		`<div class="govuk-inset-text">`,
		`  Appeal reference number: 134526 <br>`,
		`  Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom<br>`,
		`  Planning application reference: 48269/APP/2021/1482<br>`,
		`</div>`,
		`<p>The Planning Inspectorate</p>`,
		`<p>opstest@planninginspectorate.co.uk</p>`,
		`</div>`
	].join('\n')
};

export const unassignEmailTemplate = {
	renderedHtml: [
		`<div class="pins-notify-preview-border">`,
		`<p>We have removed the inspector John Smith from the appeal.</p>`,
		`<h3> Appeal details</h3>`,
		`<div class="govuk-inset-text">`,
		`  Appeal reference number: 134526 <br>`,
		`  Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom<br>`,
		`  Planning application reference: 48269/APP/2021/1482<br>`,
		`</div>`,
		`<p>The Planning Inspectorate</p>`,
		`<p>opstest@planninginspectorate.co.uk</p>`,
		`</div>`
	].join('\n')
};

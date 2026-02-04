# Navigation and back links

## How the web app is designed/structured

There are a few different sections that a user will navigate between in the Manage Appeals back office system.

- **Appeals list pages, such as the all cases page and personal list** - these pages show a list of multiple appeals with limited details
- **The case details page** - this displays full details for a single appeal
- **Flows** - these are individual user journeys consisting of one or many form pages, often finishing with a "check your answers" (CYA) page
- **Hubs** - some flows are complex and have their own landing page, for example where you can list IP comments and click to enter a flow to review them, and then return to that landing page

## Returning to the page you entered the flow from

Sometimes there may be links to a flow or hub page from multiple locations. For example, there may be a link to review a statement from both a CTA in the personal list and also from one or more CTAs on the case details page. If the user clicks back from that page, we typically want to return them to where they came from.

On the page you are linking from, you can add the back URL query param to the link:

```
import { addBackLinkQueryToUrl } from '#lib/url-utilities.js';

const linkHref = addBackLinkQueryToUrl(request, 'link/to/another/page');
```

Then on the router from the page you are linking to, add the `saveBackUrl` middleware to save the back URL query param to the session:

```
import { saveBackUrl } from '#lib/middleware/save-back-url.js';

router
	.route('/path-of-flow-entrypoint')
	.get(
		saveBackUrl('someUniqueKey'),
		asyncHandler(someController)
	)
```

Then in the controller action, you can get the back URL query param from the session:

```
import { getSavedBackUrl } from '#lib/middleware/save-back-url.js';

const backUrl = getSavedBackUrl(request, 'someUniqueKey');
```

Alternatively there is a slightly more complicated back link generator that can be used. It is useful if the flow has a check your answers page
and you are editing values, in which case it will return the CYA page if we are at the point where we started editing.

```
import { backLinkGenerator } from '#lib/middleware/save-back-url.js';

const getBackLinkUrl = backLinkGenerator('someUniqueKey');
const backUrl = getBackLinkUrl(request, '/previous/page/url', '/cya/page/url');
```

- If editing, it will return the CYA page URL.
- If not editing but a previous page is provided, it will return the URL for the previous page.
- If not editing and no previous page is provided, it will look for a saved back URL and return that, or if it does not find one it will return the case details page URL.

So if the page is at the start of a flow you would pass `null` for the previous page, and then it should work as expected in most situations.

## Editing answers from a CYA page

CYA pages usually have a summary list showing each of the answers that have been submitted as part of the flow. These typically have a "change" link next to them which takes you back to the form page in the flow where that question was asked.

Once the users clicks a "change" link, the intended behaviour is as follows:

- If the user clicks continue and continues to do so until they reach the CYA page again, their new answers are saved and displayed on the CYA page.
- If the user clicks back immediately, or after submitting invalid values and seeing a validation error message, they are returned to the CYA page with no changes to their answers.
- If the user clicks continue one or more times but does not reach the CYA page, and they then click back until reaching the page that they were originally taken to after clicking "change", when they click back again they are then returned to the CYA page but none of their new answers are saved and the original ones are still shown.

In order to make this happen we must do a few things:

- Add an `editEntrypoint` query param to the "change" link.
- Carry forward this `editEntrypoint` query param to any other page in the flow while we are still editing (we can use the `preserveQueryString` helper on the back links in GET actions and redirects in POST actions to do this).
- Use the `getSessionValues` or `getSessionValuesForAppeal` helper functions to get saved values - do not get them directly from the session.
- On any page that redirects to the CYA page, we must apply edits immediately before redirecting.
- Ideally we should also clear edits when displaying the CYA page.

When the `editEntrypoint` query param is present in the URL, the values are saved in the session to `someSessionKey/edit` instead of just `sessionKey`. This allows us to reset if the user gives up half way through editing by clicking back multiple times.

### Adding the `editEntrypoint` query param to the "change" link

We can use a helper function for this:

```
import { editLink } from '#lib/edit-utilities.js';

const changeLinkHref = editLink('/a-page-in-the-flow'),
```

### Carrying forward the `editEntrypoint` query param

In a GET action within the flow that displays a back link:

```
import { preserveQueryString } from '#lib/url-utilities.js';

const backLinkUrl = preserveQueryString(request, '/previous-page');
```

In POST actions when redirecting after a successful form submission:

```
import { preserveQueryString } from '#lib/url-utilities.js';

response.redirect(
	preserveQueryString(request, '/next-page')
);
```

### Getting session values

If the router does not have the `scopeToAppeal` option for `saveBodyToSession` (or it is set to `false`):

```
import { getSessionValues } from '#lib/edit-utilities.js';

const sessionValues = getSessionValues(request, 'changeProcedureType');
```

If the router has `{ scopeToAppeal: true }` for `saveBodyToSession`:

```
import { getSessionValuesForAppeal } from '#lib/edit-utilities.js';

const sessionValues = getSessionValuesForAppeal(request, 'changeProcedureType', appealId);
```

### Applying edits

In _any_ POST action which redirects directly to the CYA page:

```
import { applyEdits } from '#lib/edit-utilities.js';

applyEdits(request, 'setUpHearing');

return response.redirect(
	preserveQueryString(request, '/cya-page', { exclude: ['editEntrypoint'] })
);
```

### Clearing edits

In the GET action for the CYA page we should ideally clear edited values so that they don't hang around in the session:

```
import { clearEdits } from '#lib/edit-utilities.js';

clearEdits(request, 'setUpHearing');
```

## Notes

The reason we reset edited answers if the user does not complete the flow is that the form may contain invalid data if not all pages are shown. For example, if the user changes their answer to "yes" on a page that asks "do you know the address" but then does not fill in the address details on the next page, and then clicked back until they get to the CYA page, if we saved the answers they would see "yes" on the CYA page but there would be no address details, even though they are required if the answer was "yes". Therefore we need to undo any edits to avoid this kind of situation.

In the future we would like to make it so that when you edit an answer and click "continue" it will skip past any pages that already have valid answers and take you back to the CYA page as soon as possible, but this is tricky to implement considering that some pages are dependent on others, and at the moment the logic for deciding which page is next is hidden within the controllers, so it would require significant refactoring.

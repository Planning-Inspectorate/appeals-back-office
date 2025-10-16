## Back links

On the page you are linking from, you can add the back URL query param to the link:

```
import { addBackLinkQueryToUrl } from '#lib/url-utilities.js';
...
href: addBackLinkQueryToUrl(request, 'link/to/another/page')
```

Then on the router from the page you are linking to, add the saveBackUrl middleware to save the back URL query param to the session:

```
import { saveBackUrl } from '#lib/middleware/save-back-url.js';
...
.get(
	saveBackUrl('someUniqueKey'),
	asyncHandler(someControllerAction)
)
```

Then in the controller action, you can get the back URL query param from the session:

```
import { getSavedBackUrl } from '#lib/middleware/save-back-url.js';
...
const backUrl = getSavedBackUrl(request, 'someUniqueKey');
```

Alternatively there is a slightly more complicated back link generator that can be used. It is useful if the flow has a check your answers page
and you are editing values, in which case it will return the CYA page if we are at the point where we started editing.

```
import { backLinkGenerator } from '#lib/middleware/save-back-url.js';
...
const getBackLinkUrl = backLinkGenerator('someUniqueKey');
const backUrl = getBackLinkUrl(request, null, 'link/to/another/page');
```

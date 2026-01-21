import javascript
import semmle.javascript.security.SSRF as SSRF

/**
 * CustomSSRFsanitizer
 *
 * This class tells the SSRF library "treat calls to `validateAppeal` (and variants)
 * as sanitizers for SSRF sources".
 *
 * Edit `sanitizerNames` to include your project's sanitizer function names.
 */
class CustomSSRFsanitizer extends SSRF::Sanitizer {
  CustomSSRFsanitizer() { this = "CustomSSRFsanitizer" }
  override predicate isSanitizer(CallExpr call) {
    exists(Function f |
      // If the callee resolves to a named function, check its name:
      call.getCallee().(Expr).getADeclaration() = f and
      f.getName() in sanitizerNames()
    )
  }
}

/**
 * sanitizerNames()
 * Add custom sanitizer function names here
 */
private predicate sanitizerNames(string name) {
  name = "validateAppeal" 
}

/*
 * Example query: show calls recognized as sanitizers by our custom sanitizer.
 * This helps you verify the sanitizer registration is working.
 */
from CallExpr c, CustomSSRFsanitizer s
where s.isSanitizer(c)
select c, "This call is treated as an SSRF sanitizer by CustomSSRFsanitizer."


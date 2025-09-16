import javascript
import semmle.javascript.security.dataflow.SSRF

/**
 * Custom sanitizers for our project.
 */
class RouterValidationSanitizer extends SSRF::Sanitizer {
  RouterValidationSanitizer() {
    this.hasLocationInfo("validateAppeal")
  }
}
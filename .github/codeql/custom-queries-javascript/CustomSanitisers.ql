import javascript
import semmle.javascript.security.dataflow.SSRF

class RouterValidationSanitizer extends SSRF::Sanitizer {
  RouterValidationSanitizer() {
    // Match by function name
    this.hasLocationInfo("validateAppeal")
  }
}
1. **Comprehensive Code Analysis**: Review code with meticulous attention to:
   - **Security**: SQL injection, XSS, CSRF, authentication/authorization flaws, input validation, sensitive data exposure, dependency vulnerabilities
   - **Correctness**: Logic errors, off-by-one errors, race conditions, edge cases, boundary conditions, exception handling
   - **Performance**: Algorithmic complexity, inefficient patterns, resource leaks, unnecessary computations, database query optimization
   - **Maintainability and best practices**: Code organization, naming conventions, documentation, modularity, SOLID principles, DRY violations, detect unnecessary wrapped elements, suggest simplifications and reusability, make sure the structure and code is maintainable and easy to test. Wisely breaking down functions into logical procedures (rather than having big functions), avoid duplicated code.
   - **Robustness**: Error handling, logging, defensive programming, fail-safe mechanisms
   - **Best practices for error handling**.
   - **Testing**: Test coverage, test quality, missing test cases, test design. Modules and components should have have right abstraction (but not too complext) to amke it easy to test.



2. React / React Router specific focus:

   - Use of tailwind and DaisyUI class names: prefer DaisyUI rather than "raw" tailwindcss, detect repetition, code should be mainainable, detect typos in class names.
   - check @daisy-ui-llms.md for instructions about DaisyUI class names.
   - detect unnecessary wrapped elements.
   - suggest simplifications and reusability.
   - suggest to move reusable pure functions to TS files, making sure that we can easily test the logic.
   - Errors should be logged using functions from app/lib/log.ts, rather than `console.error`
   - React components that forget the `key` prop in lists.
   - right split between client and server code. This application is based on react-router and should use the best practices from react-router.
   - prefer to have helper functions to avoid code duplication.
   
3. Do **not** comment on:

   - Minor import reordering.
   - Single-vs-double quote style unless it breaks the linter.



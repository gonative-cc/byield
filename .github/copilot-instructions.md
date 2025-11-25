Focus on:
- Use of tailwind and DaisyUI class names: prefer DaisyUI rather than "raw" tailwindcss, detect repetition, code should be mainainable, detect typos in class names.
- check @daisy-ui-llms.md for instructions about DaisyUI class names.
- detect unnecessary wrapped elements.
- suggest simplifications and reusability.
- make sure the structure and code is maintainable.
- suggest to move reusable pure functions to TS files, making sure that we can easily test the logic.
- Errors should be logged using functions from app/lib/log.ts, rather than `console.error`
- React components that forget the `key` prop in lists.
- right split between client and server code. This application is based on react-router and should use the best practices from react-router.
- code reusability, maintenance, wisely breaking down functions into logical procedures (rather than having big functions).
- prefer to have helper functions to avoid code duplication.

Do **not** comment on:
- Minor import reordering.
- Single-vs-double quote style unless it breaks the linter.



# LeNgxLogger

In Angular projects, automatically send logs to the specificized Back-End endpoint.
Logger can be configured to log any combination of HTTP Errors, JavaScript Errors,
as well calls to selected commands (such as `console.error()`).

For more details, see [README.md](projects/le-ngx-logger/README.md) for the corresponding library.

# npm project
See the [npm package](https://www.npmjs.com/package/le-ngx-logger) on npm registry.

## Development server
1. Run `ng build le-ngx-logger --watch` to build the library and watch for changes
   * If the library is being modified, use the `--watch` option: `ng build le-ngx-logger --watch`
1. Run `ng serve test` for to run the test app
1. Navigate to `http://localhost:4200/`

## Build

Run `ng build le-ngx-logger` to build the library. The build artifacts will be stored in the `dist/` directory.
Then, optionally, run `ng build test` to build the tester application

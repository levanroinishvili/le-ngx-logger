import { LeNgxLoggerFullConfig } from "./le-ngx-logger.model";

export const LE_NGX_SERVICE_DEFAULT_CONFIG: LeNgxLoggerFullConfig = {

    /** Endpoint where the errors will be POSTed */
    endpoint: 'http://logger.server.rs/admincp',

    report: {

        // If false, overrides other settings and disables all reporting on development or production environment
        onDev: true,
        onProd: true,

        httpErrors: true, // Report http calls via HttpClient module
        jsErrors: true, // Report JavaScript runtime errors

        // Report (mirror to server) various commands, such as console.log() or window.alert()
        // Cannot populate this here with objects that have cyclical structure. Otherwise `mergeProps` will fail
        monkeypatch: [],
    },

    delay: 0, // Milliseconds - Delay report after error

    // HTTP Headers will be added to the API call carrying an error report
    httpHeaders: {
        'Logger-Report': 'Le-Ngx-Logger'
    },

    reportingFailureMessage: 'Could not send log to server',

    debug: {
        onDev: true,
        onProd: false,
    }
}

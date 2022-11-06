import { PartialDeep } from "./le-ngx-logger.utils"

export type LeNgxLoggerConfig = PartialDeep<LeNgxLoggerFullConfig>

export type LeNgxLoggerFullConfig = {

    /** Endpoint where the errors will be POSTed */
    endpoint: string

    report: {

        // If false, overrides other settings and disables all reporting on development or production environment
        onDev: boolean
        onProd: boolean

        httpErrors: boolean // Report http calls via HttpClient module
        jsErrors: boolean // Report JavaScript runtime errors

        // Report (mirror to server) various commands, such as console.log() or window.alert()
        monkeypatch: Array<{
            parent: any
            methods: {
                [key: string]: boolean | {
                    on: boolean
                    /** Optional name, for cases when the Logger cannot automatically determine the name of the method being logged */
                    name?: string
                    /** Optional context, if the method needs to be bount to a context */
                }
            }
        }>
    },

    /** Milliseconds - Delay report after error */
    delay: number,

    /** HTTP Headers will be added to the API call carrying an error report */
    httpHeaders: {[key: string]: string}

    reportingFailureMessage: string

    debug: {
        onDev: boolean
        onProd: boolean
    }
}

export interface leNgxLoggerLoggableError {
    name: string | null
    message: string | null
    stack: string[] | null
    http?: {
      url: string | null
      urlWithParams: string | null
      params: Record<string, string>
      method: 'POST' | 'GET' | 'PUT' | 'PATCH' | 'DELETE'
      status: number
      statusText: string | null
      requestBody: any
      responseBody: any
    }
}

export interface leNgxLoggerLoggableEvent {
  command: null | string // Name of the command - function
  parameters: null | any[] // Command parameters
  result: any, // Command result
  error: null | leNgxLoggerLoggableError
  timeZone: string,
  navigator: {
    userAgent: string,
    language: string,
  }
  data?: any
}

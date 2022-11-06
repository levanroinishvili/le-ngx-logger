import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { ErrorHandler, Inject, Injectable, isDevMode, Optional } from '@angular/core';
import { catchError, firstValueFrom, Observable, of, switchMap, throwError, timer, } from 'rxjs';
import { ajax, } from 'rxjs/ajax';
import { leNgxLoggerIsOn, mergeProps, removeCycles } from './le-ngx-logger.utils';
import { LE_NGX_SERVICE_DEFAULT_CONFIG as defaultConfig } from './le-ngx-logger.config';
import { LE_NGX_LOGGER_CONFIG } from './le-ngx-logger.token';
import { LeNgxLoggerConfig, LeNgxLoggerFullConfig, leNgxLoggerLoggableError, leNgxLoggerLoggableEvent } from './le-ngx-logger.model';

@Injectable({
  providedIn: 'any'
})
export class LeNgxLoggerService implements ErrorHandler, HttpInterceptor {

  private config: LeNgxLoggerFullConfig
  private debug: boolean
  readonly console = {...console}
  private seenError = Symbol('seenError')

  log(event: Partial<leNgxLoggerLoggableEvent>) {
    const payload: leNgxLoggerLoggableEvent = removeCycles({
      error: event.error ?? null,
      command: event.command ?? null,
      parameters: event.parameters ?? null,
      result: event.result,
      timeZone: event.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
      navigator: event.navigator ?? {
        userAgent: navigator.userAgent,
        language: navigator.language,
      },
      data: event.data,
    })

    // Report using RxJS Ajax - will be intercepted by HTTP Interceptors
    const report$ = timer(this.config.delay).pipe(
      switchMap(() => ajax.post<void>(
        this.config.endpoint,
        removeCycles(payload),
        this.config.httpHeaders
      )),
      catchError(() => (this.console.warn(this.config.reportingFailureMessage), of(undefined)))
    )
    return firstValueFrom(report$)
  }

  /** HTTP Interceptor to report HTTP errors */
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.debug && this.console.log(`%cIntercepted API call %c${request.url}`, 'color:red', 'color:yellow', request.headers)
    return this.config.report.httpErrors
      ? next.handle(request).pipe(
          catchError((error: HttpErrorResponse) => {
            const hasErrorReportHeaders = Object.entries(this.config.httpHeaders).every(([key, value]) => request.headers.get(key) === value)
            hasErrorReportHeaders || this.log({error: this.formatHttpError(error, request)}) // Extra protection from cyclical attempts for error reporting
            return throwError(() => error) // Relay error down the interceptor chain
          })
        )
      : next.handle(request)
  }

  /** Callback where Angular sends JavaScript runtime errors */
  handleError(error: any): void {
    if (error[this.seenError]) return
    if ( this.config.report.jsErrors ) {
      // Ignoring HttpErrorResponse because it should be handled by the HTTP interceptor
      if ( ! (error.rejection instanceof HttpErrorResponse || error instanceof HttpErrorResponse) ) {
        this.debug && this.console.log('%cReporting JavaScript runtime error', 'color:orange', error)
        this.log({error: this.formatError(error)})
      } else {
        this.debug && this.console.log('%cNOT %creporting JavaScript runtime error', 'color:red', 'color:orange', error)
      }
    }
    error[this.seenError] = true
    this.console.error(error)
    // throw error
  }

  constructor(
    @Inject(LE_NGX_LOGGER_CONFIG) @Optional() customConfig: LeNgxLoggerConfig,
  ) {
    this.config = mergeProps(defaultConfig, customConfig ?? {}, 10) // If customConfig is not provided, it will be `null`, not `undefined`, causing `this.config=null`
    customConfig || this.showUsage()
    const devMode = isDevMode()
    this.debug = devMode && this.config.debug.onDev || ! devMode && this.config.debug.onProd

    const serviceOn = leNgxLoggerIsOn(devMode, this.config)
    this.debug && this.console.log(`%cInitializing %cRemote Logger%c service: %c${serviceOn?'ON':'OFF'}`, 'color:yellow', 'color:red', '', 'color:red')
    serviceOn && this.monkeypatch()
  }

  private formatHttpError(e: HttpErrorResponse, request?: HttpRequest<any>): leNgxLoggerLoggableError {
    return {
      name: e.name,
      message: e.message,
      stack: null,
      http: {
        url: request?.url ?? e.url, // : string | null;
        urlWithParams: request?.urlWithParams ?? e.url, // : string | null;
        params: Object.fromEntries(request?.params.keys().map(key => [key, request.params.getAll(key)!.join(' | ')] as const) ?? []),
        method: request?.method as any,
        status: e.status, // : number
        statusText: e.statusText, // : string
        requestBody: request?.body,
        responseBody: e.error instanceof ProgressEvent ? null : e.error,
      }
    }
  }

  private formatError(error: Error): leNgxLoggerLoggableError {
    return {
      // ...error, // Send unconventional props
      name: error.name, // May otherwise be ignored, as this can be not enumerable on parent
      message: error.message, // May otherwise be ignored, as this can be not enumerable
      stack: error.stack?.split('\n').map(s => s.trim()) ?? null // May otherwise be ignored, as this can be not enumerable
    }
  }

  /** Monkye-Patch the configured methods to log their input-output to server */
  private monkeypatch() {
    this.config.report.monkeypatch
      .forEach(family => {
        const parent: any = family.parent
        Object.entries(family.methods)
          .map(([method, tickOrMeta]) => [method, typeof tickOrMeta === 'object' ? {...tickOrMeta, name: tickOrMeta.name ?? parent[method].name} : {on: tickOrMeta, name: parent[method].name}] as const)
          .filter(([  , {on: isOn}]) => isOn)
          .forEach(([method, {name}]) => parent[method] = this.wrapWithReporter(parent[method], family, name))
        }
      )
  }

  /** Takes a function and wraps it into another function that reports */
  private wrapWithReporter(f: (...args: any[]) => any, context?: any, name?: string) {
    const originalFnName = name ?? f.name
    this.debug && this.console.log(`Moneky-patching %c${originalFnName}`, 'color:green')
    f = context ? f.bind(context) : f
      return (...args: any[]) => {
        args = args.map(a => a instanceof Error ? this.formatError(a) : a)
        const result = f(...args)
        this.log({command: originalFnName, parameters: args, result})
    }
  }

  private showUsage() {
    this.console.warn(
      `Module "LeNgxLoggerModule" needs configObject: LeNgxConfig.\n` +
      `configObject can be provided by importing "LeNgxLoggerModule" with "LeNgxLoggerModule.forRoot(configObject)"\n` +
      `Alternatively, provde LE_NGX_LOGGER_CONFIG {provide: LE_NGX_LOGGER_CONFIG, useValue: configObject}`
    )
    this.console.warn('Alternatively, ')
  }

}

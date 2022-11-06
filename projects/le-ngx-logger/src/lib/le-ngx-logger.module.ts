import { ErrorHandler, NgModule, isDevMode, ModuleWithProviders } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http'
import { LeNgxLoggerConfig } from './le-ngx-logger.model'
import { LE_NGX_LOGGER_CONFIG } from './le-ngx-logger.token'
import { LE_NGX_SERVICE_DEFAULT_CONFIG as defaultConfig } from './le-ngx-logger.config'
import { leNgxLoggerIsOn, mergeProps } from './le-ngx-logger.utils'
import { LeNgxLoggerService } from './le-ngx-logger.service'

const devMode = isDevMode()

@NgModule({
  providers: [
    LeNgxLoggerService,
  ]
})
export class LeNgxLoggerModule {
  static forRoot(config?: LeNgxLoggerConfig): ModuleWithProviders<LeNgxLoggerModule> {
    return {
      ngModule: LeNgxLoggerModule,
      providers: [
        LeNgxLoggerService,
        {
          provide: LE_NGX_LOGGER_CONFIG,
          useValue: mergeProps(defaultConfig, config, 10)
        },
        leNgxLoggerIsOn(devMode, config) && (config?.report?.httpErrors ?? defaultConfig.report.httpErrors) ? {
          provide: HTTP_INTERCEPTORS,
          useExisting: LeNgxLoggerService,
          multi: true
        } : [ ],

        leNgxLoggerIsOn(devMode, config) && (config?.report?.jsErrors ?? defaultConfig.report.jsErrors) ? {
          provide: ErrorHandler,
          useExisting: LeNgxLoggerService
        } : [ ],
      ]
    }
  }

  constructor(
    // Consumate provision of the `LeNgxLoggerService`, since it may not be instantiated when it has has no direct consumers.
    // This is necessary when `JSErrors` and `HTTPErrors` are not being reported, but some methods are being monkeypatched for reporting.
    leNgxLoggerService: LeNgxLoggerService,
  ) {}
}

# LeNgxLogger

Automatically log any combination of HTTP Errors, JavaScript Errors and calls to selected commands (such as console.error).

Also, these can be separately enabled for development and production environments.

Debug mode can also be separately enabled for development and production environments.

# Installing
`npm install le-ngx-logger`

# Usage
## Importing Into The Application
`LeNgxLoggerModule` should be imported into the main `app.module.ts` with the configuration object.

If HTTP errors need to be reported, then `LeNgxLoggerModule` must be imported **before** `HttpClientModule`.

## Supplying The Configuration Object
There are two ways to supply the configuration object to `LeNgxLoggerModule`:
1. [By using the `.forRoot()` pattern](#forroot-option)
1. [By providing `LE_NGX_LOGGER_CONFIG`](#providing-le_ngx_logger_config)

### forRoot option
For convenience, configuration can be enclosed into a separate ngModule `app-logger.module.ts`.

Contents of sample file `app-logger.module.ts`:

```typescript
import { NgModule } from "@angular/core";
import { LeNgxLoggerConfig, LeNgxLoggerModule } from "le-ngx-logger";

const leNgxLoggerConfig: LeNgxLoggerConfig = {
    endpoint: 'https://www.report-errors.xe/le-error',
    report: {
        monkeypatch: [
            {
                parent: console,
                methods: {
                    log: { on: true, name: 'console.log' },
                    error: { on: true, name: 'console.error' },
                    warn: true,
                    info: { on: true, name: 'console.info' },
                    assert: true,
                    table: { on: true, name: 'console.table' },
                }
            },
            {
                parent: window,
                methods: {
                    alert: { on: true, name: 'alert' },
                }
            }
        ]
    }
}

@NgModule({
    imports: [LeNgxLoggerModule.forRoot(leNgxLoggerConfig)],
    exports: [LeNgxLoggerModule],
})
export class AppLoggerModule { }
```
This module can now be imported into `AppModule`:

Contents of sample file `app.module.ts`:
```typescript
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppLoggerModule } from './app-logger.module'

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,

    // import before HttpClientModule
    AppLoggerModule,

    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

### Providing LE_NGX_LOGGER_CONFIG
Contents of sample file `app.module.ts`:
```typescript
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { LeNgxLoggerConfig, LeNgxLoggerModule, LE_NGX_LOGGER_CONFIG } from 'le-ngx-logger';

import { AppComponent } from './app.component';

const leNgxLoggerConfig: LeNgxLoggerConfig = {
  endpoint: 'https://www.report-errors.xe/le-error',
  report: {
      monkeypatch: [
          {
              parent: console,
              methods: {
                  log: { on: true, name: 'console.log' },
                  error: { on: true, name: 'console.error' },
                  warn: true,
                  info: { on: true, name: 'console.info' },
                  assert: true,
                  table: { on: true, name: 'console.table' },
              }
          },
          {
              parent: window,
              methods: {
                  alert: { on: true, name: 'alert' },
              }
          }
      ]
  }
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,

    // import before HttpClientModule
    LeNgxLoggerModule,

    HttpClientModule,
  ],
  providers: [
    {provide: LE_NGX_LOGGER_CONFIG, useValue: leNgxLoggerConfig}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

# Reporting Errors Manually

Contents of sample file `app.component.ts`:
```typescript
import { Component } from '@angular/core';
import { LeNgxLoggerService } from 'le-ngx-logger';

@Component({
  selector: 'test-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(
    private loggerService: LeNgxLoggerService,
  ) {}

  logQuick(data: string) {
    this.loggerService.log({data})
  }

  logFull(event: leNgxLoggerLoggableEvent) {
    this.loggerService.log(event)
  }

}
```
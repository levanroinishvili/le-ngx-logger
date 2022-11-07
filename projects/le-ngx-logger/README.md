# LeNgxLogger

In Angular projects, automatically send logs to the specificized Back-End endpoint.
Logger can be configured to log any combination of HTTP Errors, JavaScript Errors,
as well as calls to selected commands (such as `console.error()`).

Each of these options can be separately enabled for development and production environments.
Similarly, Debug mode can be enabled separately for each environment.
(see [Format of the Configuration Object](#format-of-the-configuration-object) for details).

## Contents
* [GitHub Home](#github-home)
* [Installation](#installation)
* [Usage](#usage)
  * [Importing Into The Application](#importing-into-the-application)
  * [Format of the Configuration Object](#format-of-the-configuration-object)
  * [Supplying The Configuration Object](#supplying-the-configuration-object)
    * [`.forRoot()` Option](#forroot-option)
    * [Providing `LE_NGX_LOGGER_CONFIG`](#providing-le_ngx_logger_config)
  * [Logging Data Explicitly](#logging-data-explicitly)
## GitHub Home
See the [source code](https://github.com/levanroinishvili/le-ngx-logger) on GitHub

## Installation
`npm install le-ngx-logger`

## Usage
### Importing Into The Application
`LeNgxLoggerModule` should be imported into the main `app.module.ts` with the configuration object.

See [Format of the Configuration Object](#format-of-the-configuration-object) for details how to build the Configuration Object.
Once created, the object can be supplied into the Logger using one of the two options:

    * [Using `.forRoot()` Option](#forroot-option)
    * [Providing `LE_NGX_LOGGER_CONFIG`](#providing-le_ngx_logger_config)

### Format of the Configuration Object

The Configuration Object will override default values baked into the Logger. All properties are optional.
However, at least the `endpoint` should be provided so that the logs are correctly sent to the endpoint
that records the logs.

```TypeScript
import { LeNgxLoggerConfig } from 'le-ngx-logger';

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
    },
    delay: 1000, // Milliseconds - Delay report after error

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
```


### Supplying The Configuration Object

See [Configuration Object Format](#format-of-the-configuration-object) for information on creating the Configuration Object.

Once Configuration Object is created, it can be supplied into `LeNgxLoggerModule` by either of the following two methods:
1. [By using the `.forRoot()` pattern](#forroot-option)
1. [By providing `LE_NGX_LOGGER_CONFIG`](#providing-le_ngx_logger_config)

#### `.forRoot()` Option

Here is an example of importing `LeNgxLoggerModule` directly into `AppModule` using `.forRoot()` pattern:

```typescript
import { LeNgxLoggerModule } from 'le-ngx-logger';

// Create or import `leNgxLoggerConfig`
const leNgxLoggerConfig: LeNgxLoggerConfig = { /* ... */ }

@NgModule({
  imports: [
    LeNgxLoggerModule.forRoot(leNgxLoggerConfig),
  ]
})
export class AppModule { }
```

Alternatively, the details of configuring `LeNgxLoggerModule` can be sequestered into a separate ngModule, e.g. `app-logger.module.ts`.

Excerpt from a sample file `app-logger.module.ts`:

```typescript
import { NgModule } from "@angular/core";
import { LeNgxLoggerConfig, LeNgxLoggerModule } from "le-ngx-logger";

const leNgxLoggerConfig: LeNgxLoggerConfig = { /* ... */ }

@NgModule({
    imports: [LeNgxLoggerModule.forRoot(leNgxLoggerConfig)],
    exports: [LeNgxLoggerModule],
})
export class AppLoggerModule { }
```
This module can now be imported into `AppModule`:

Excerpt from the sample file `app.module.ts`:
```typescript
import { AppLoggerModule } from './app-logger.module'

@NgModule({
  imports: [
    AppLoggerModule,
  ]
})
export class AppModule { }
```

#### Providing `LE_NGX_LOGGER_CONFIG`
Contents of sample file `app.module.ts`:
```typescript
import { LeNgxLoggerModule, LE_NGX_LOGGER_CONFIG } from 'le-ngx-logger';

// Create or import `leNgxLoggerConfig`
const leNgxLoggerConfig: LeNgxLoggerConfig = { /* ... */ }

@NgModule({
  imports: [
    LeNgxLoggerModule,
  ],
  providers: [
    {provide: LE_NGX_LOGGER_CONFIG, useValue: leNgxLoggerConfig}
  ]
})
export class AppModule { }
```

## Logging Data Explicitly
The logger can be configured to function automatically, without the need for any explicit intervention.
But, if required, it can be invoked explicitly.

To achieve that, import the `LeNgxLoggerService` and call its `.log(event)` method.

The method takes a single parameter of type `Partial<leNgxLoggerLoggableEvent>`:
```typescript
interface leNgxLoggerLoggableEvent {
    command: null | string;
    parameters: null | any[];
    result: any;
    error: null | leNgxLoggerLoggableError;
    timeZone: string;
    navigator: {
        userAgent: string;
        language: string;
    };
    data?: any;
}
```

To log arbitrary data, use the optional member `data`.

Here is an example.

Excerpt from a sample file `app.component.ts`:
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

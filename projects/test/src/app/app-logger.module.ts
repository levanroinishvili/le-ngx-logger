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

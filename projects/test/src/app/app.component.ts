import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { LeNgxLoggerService } from 'le-ngx-logger';

@Component({
  selector: 'test-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(
    private httpClint: HttpClient,
    private loggerService: LeNgxLoggerService,
  ) {}

  logManually(data: string) {
    this.loggerService.log({data})
  }

  makeHttpError404(): void {
    this.httpClint.get('https://httpstat.us/404', {params: {sleep: 1000}}).subscribe()
  }

  makeHttpSuccess200(): void {
    this.httpClint.get('https://httpstat.us/200', {params: {sleep: 1000}}).subscribe()
  }

  makeTypeError() {
    const a = undefined as any
    a.prop
  }

}

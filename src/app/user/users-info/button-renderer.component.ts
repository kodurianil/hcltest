// Author: T4professor

import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-button-renderer',
  template: `
    <button type="button" [class]="className" (click)="onClick($event)">{{label}}</button>
    `
})

export class ButtonRendererComponent implements ICellRendererAngularComp {

  params: any;
  label!: string;
  className!: string;
  agInit(params: any): void {
    this.params = params;
    this.label = this.params.label || null;
    this.className = this.params.className || null;
  }

  refresh(): boolean {
    return true;
  }

  onClick($event: any) {
    console.log(this.params);
    if (this.params.onClick instanceof Function) {
      // put anything into params u want pass into parents component
      const params = {
        event: $event,
        rowData: this.params.node.data,
        rowIndex: this.params.node.rowIndex,
        // ...somethingthis.params.node.data,
      }
      this.params.onClick(params);

    }
  }
}
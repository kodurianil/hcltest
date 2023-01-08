import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersInfoComponent } from './users-info/users-info.component';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { NgbAlertModule, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { UserEditComponent } from './user-edit/user-edit.component';

const routes: Routes = [
  {
    path: 'users-info',
    component: UsersInfoComponent
  },
  {
    path: '',
    redirectTo: 'users-info',
    pathMatch: 'full'
  }
];

@NgModule({
  declarations: [
    UsersInfoComponent,
    UserEditComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    AgGridModule,
    NgbAlertModule,
    NgbModalModule
  ]
})
export class UserModule { }

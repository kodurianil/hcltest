import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { SkipLimit, UserService } from '../services/user.service';
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { User, UsersResp } from '../users';
import { ColDef, ValueGetterParams, GridApi, GridReadyEvent } from 'ag-grid-community';
import { ButtonRendererComponent } from './button-renderer.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserEditComponent } from '../user-edit/user-edit.component';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-users-info',
  templateUrl: './users-info.component.html',
  styleUrls: ['./users-info.component.css']
})
export class UsersInfoComponent implements OnInit {

  @ViewChild('content', {read: TemplateRef}) 
  content!: TemplateRef<NgbModal>;
  pageForm = new FormGroup({
    limit: new FormControl(10, [Validators.required]),
    skip: new FormControl(0, []),
    total: new FormControl(0, []),
    totalPages: new FormControl(0, []),
    currentPage: new FormControl(1, []),
    search: new FormControl('', [Validators.required])
  })
  private gridApi!: GridApi<User>;
  users!: User[];
  // rowHeight: number = 50;
  columnDefs: ColDef[] = [
    { field: 'id', headerName: 'User Id', width: 90},
    { field:'name', headerName: 'Name', cellRenderer: fullNameGetter,  width: 140},
    { field: 'age', headerName: 'Age', width: 90 },
    { field: 'gender', headerName: 'Gender', width: 95 },
    { field: 'email', headerName: 'Email' },
    { field: 'phone', headerName: 'Phone Number', width: 150 },
    { field: 'image', headerName: 'Profile Picture', width: 100, cellRenderer: imageGetter },
    { field: 'company.name', headerName: 'Company Name',  width: 150, cellRenderer:  companyNameGetter},
    { field: 'company.address',wrapText: false, headerName: 'Address', cellRenderer: companyAddressGetter, width: 150 },
    {
      headerName: 'Edit',
      cellRenderer: 'buttonRenderer',
      cellRendererParams: {
        onClick: this.onEditButtonClick.bind(this),
        label: 'Edit',
        className:  'btn btn-primary'
      },
      width: 90
    },
    {
      headerName: 'Delete',
      cellRenderer: 'buttonRenderer',
      cellRendererParams: {
        onClick: this.onDeleteButtonClick.bind(this),
        label: 'Delete',
        className:  'btn btn-danger'
      },
      width: 110
    },
  ];
  frameworkComponents: any;
  // DefaultColDef sets props common to all Columns
  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    wrapText: true,
    autoHeight: true
  };
  alert: any = {
    type: 'success',
    message: ''
  };
  hideNext!: boolean;
  hidePrev!: boolean;
  searchLoading: boolean = false;
  constructor(
    private userService: UserService,
    private modalService: NgbModal
  ) { 
    this.frameworkComponents = {
      buttonRenderer: ButtonRendererComponent,
    };
    this.pageForm.get('search')?.valueChanges.pipe(
      tap(() => {
        this.searchLoading = true;
      }),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((res: any) => {
        if (!res) {
          return of('')
        }
        return this.userService.searchInUser(res);
      })
    ).subscribe((value: any) => {
      this.searchLoading = false;
      if (!this.pageForm.get('search')?.value) {
        this.clearSearch();
      } else {
        this.users = value.users;
      }
    });
  }
  // search() {
  //   const value = this.pageForm.get('search')?.value;
  //   if (value) {
  //     this.userService.searchInUser(value).subscribe((res: any) => {
  //       this.users = res.users;
  //     })
  //   }
  // }
  clearSearch() {
    this.searchLoading = false;
    this.pageForm.get('skip')?.setValue(0);
    this.pageForm.get('currentPage')?.setValue(1);
    this.getUsers();
  }
  ngOnInit(): void {
    this.getUsers();
  }
  onGridReady(params: GridReadyEvent<User>) {
    this.gridApi = params.api;
  }
  getUsers() {
    const params = this.pageForm.value as any;
    this.userService.getUsers(params as SkipLimit).subscribe((res: UsersResp) => {
      this.users = res.users;
      this.hideNext = (params.currentPage * res.limit) == res.total;
      this.hidePrev = (params.currentPage * res.limit) + (res.skip - res.limit) == 0;
      
      this.pageForm.get('total')?.setValue(res.total);
      this.pageForm.get('totalPages')?.setValue(res.total/res.limit);
    })
  }
  changelimit(limit: number) {
    this.pageForm.get('limit')?.setValue(limit);
    this.pageForm.get('currentPage')?.setValue(1);
    this.pageForm.get('skip')?.setValue(0);
    this.getUsers();
  }
  get limit() {
    return (this.pageForm.get('limit') as FormControl).value;
  }
  onEditButtonClick(params: any)
  {
    this.open(params.rowIndex, params.rowData);
  }
  open(index: number, row: any) {
		const editComp = this.modalService.open(UserEditComponent)
    editComp.componentInstance.user = row;
    editComp.result.then(
			(result) => {
        console.log(result);
				this.users.splice(index, 1, result);
        this.gridApi.setRowData(this.users);				
			},
			(reason) => {

			},
		);
	}
  onDeleteButtonClick(params: any)
  {
    if (confirm('Are you sure want to delete?')) {
      this.userService.deleteUser(params.rowData.id).subscribe((res: any) => {
        if (res.isDeleted) {
          this.alert.message = `${params.rowData.id} is delete successfully.`;
          this.alert.type = 'success';
          console.log(params.rowIndex);
          this.users.splice(params.rowIndex, 1);
          this.gridApi.setRowData(this.users)
          // this.getUsers();
        } else {
          this.alert.message = `${params.rowData.id} is not delete successfully.`;
          this.alert.type = 'dangger';
        }

        setTimeout(() => {
          this.alert.message = '';
        }, 2000)
      })
    }
  }
  close(alert: any) {
    alert.message = '';
  }

  onPrevious() {
    let cV = +(this.pageForm.get('currentPage')?.value as number);
    if (cV > 1) {
      cV = cV - 1;
      let limit = +(this.pageForm.get('limit')?.value as number);
      this.pageForm.get('skip')?.setValue(((cV - 1) * limit));
  
      this.pageForm.get('currentPage')?.setValue((cV));
      
      this.getUsers();
    }
  }
  onNext() {
    let cV = +(this.pageForm.get('currentPage')?.value as number);
    let totalPages = +(this.pageForm.get('totalPages')?.value as number)
    if (cV < totalPages) {
      let limit = +(this.pageForm.get('limit')?.value as number);
      this.pageForm.get('skip')?.setValue((cV * limit));
      cV = cV + 1;
      this.pageForm.get('currentPage')?.setValue((cV));
      this.getUsers();
    }
  }
}

function fullNameGetter(params: ValueGetterParams) {
  return `${params.data['firstName']} ${params.data['lastName']}`
}

function imageGetter(params: ValueGetterParams) {
  return `<img src="${params.data['image']}"  width="50px"/>`
}

function companyNameGetter(params: ValueGetterParams) {
  return `${params.getValue('company.name')}`
}

function companyAddressGetter(params: ValueGetterParams) {
  return `<span>${params.data.company.address.address}, ${params.data.company.address.city}, ${params.data.company.address.state} - ${params.data.company.address.postalCode}}</span>`
}

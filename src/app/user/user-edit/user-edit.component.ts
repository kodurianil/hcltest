import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../services/user.service';
import { User } from '../users';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css']
})
export class UserEditComponent implements OnInit {
  protected _user!: User;
  @Input()
  set user(value: User) {
    this._user = value;
    console.log(value);
  }

  get user() {
    return this._user;
  }
  alert: any = {
    type: 'success',
    message: ''
  };
  address = new FormGroup({
    address: new FormControl('', {
      validators: [Validators.required]
    }),
    city: new FormControl('', {
      validators: [Validators.required]
    }),
    postalCode: new FormControl('', {
      validators: [Validators.required]
    }),
    state: new FormControl('', {
      validators: [Validators.required]
    }),
  });
  comapny = new FormGroup({
    address: this.address,
    department: new FormControl('', {
      validators: [Validators.required]
    }),
    name: new FormControl('', {
      validators: [Validators.required]
    }),
    title: new FormControl('', {
      validators: [Validators.required]
    })
  })
  userFormGroup: FormGroup = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    age: new FormControl('', [Validators.required]),
    gender: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required]),
    phone: new FormControl('', [Validators.required]),
    company: this.comapny
  }, { updateOn: 'blur' });
  constructor(
    public activeModal: NgbActiveModal,
    private userServie: UserService
    ) { }

  ngOnInit(): void {
    this.userFormGroup.patchValue(this.user);
  }
  isRequired(name: string) {
    return this.userFormGroup.get(name)?.errors
  }
  saveUser() {
    const id = this.user.id;
    const payload = {
      ...this.user,
      ...this.userFormGroup.value
    }
    delete payload.id;
    this.userServie.editUser(id, payload).subscribe(
      res => {
        this.alert.type = "success";
        this.alert.message = 'Successfully updated!'
        setTimeout(() => {
          this.activeModal.close(res)
        }, 1000);
      }
    );
  }

}

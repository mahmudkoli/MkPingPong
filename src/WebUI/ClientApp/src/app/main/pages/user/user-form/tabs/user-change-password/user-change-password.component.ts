import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { AbstractControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BehaviorSubject, Subscription } from 'rxjs';
import { UserChangePassword } from '../../../shared/user.model';
import { UserService } from '../../../shared/user.service';
import { finalize } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';

export class PasswordValidation {
	static MatchPassword(AC: AbstractControl) {
		const newPassword = AC.get('newPassword').value;
		const confirmPassword = AC.get('confirmPassword').value;
		if (newPassword !== confirmPassword) {
			AC.get('confirmPassword').setErrors( {MatchPassword: true} );
		} else {
			return null;
		}
	}
}

@Component({
  selector: 'app-user-change-password',
  templateUrl: './user-change-password.component.html',
  styleUrls: ['./user-change-password.component.scss']
})
export class UserChangePasswordComponent implements OnInit, OnDestroy {
	// Public properties
	@Input() userId: string;
	@Input() loadingSubject: BehaviorSubject<boolean>;
	hasFormErrors: boolean = false;
	userPassword: UserChangePassword;
	changePasswordForm: FormGroup;
	errors: any[];
	// Private properties
	private subscriptions: Subscription[] = [];

  	constructor(private fb: FormBuilder, 
    private userService: UserService,
    private matSnackBar: MatSnackBar) { }

	ngOnInit() {
		if(!this.loadingSubject.value)
			this.loadingSubject.next(false);
		this.resetAll();
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	loadInitData() {
		this.userPassword.id = this.userId;
	}

	createForm() {
		this.changePasswordForm = this.fb.group({
			newPassword: ['', Validators.required],
			confirmPassword: ['', Validators.required]
		});
	}

	resetErrors() {
		this.hasFormErrors = false;
		this.errors = [];
	}

	resetAll() {
		this.userPassword = new UserChangePassword();
		this.userPassword.clear();
		this.loadInitData();
		this.createForm();
		this.resetErrors();
		this.changePasswordForm.markAsPristine();
		this.changePasswordForm.markAsUntouched();
		this.changePasswordForm.updateValueAndValidity();
	}

	onSubmit() {
		this.resetErrors();
		const controls = this.changePasswordForm.controls;
		
		PasswordValidation.MatchPassword(this.changePasswordForm);
		if (this.changePasswordForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.errors.push('Oh snap! Password does not match.');
			return;
		}

		this.userPassword.newPassword = controls['newPassword'].value;
		
		this.loadingSubject.next(true);
		const changePasswordSubscription =  this.userService.userChangePassword(this.userPassword)
			.pipe( finalize(() => this.loadingSubject.next(false)))
			.subscribe(res => {
				const message = `User password successfully has been changed.`;
				this.matSnackBar.open(message, 'Update');
			},
			error => {
				this.throwError(error);
			});
		this.subscriptions.push(changePasswordSubscription);

		this.resetAll();
	}

	onAlertClose($event) {
		this.resetErrors();
	}

	throwError(error) {
		this.hasFormErrors = true;
		this.errors.push(error.error.message || error.error.title || error.error || error.statusText);
		console.error(error);
	}
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { User, SaveUser } from '../shared/user.model';
import { BehaviorSubject, Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { KeyValuePair } from '../../shared/key-value-pair.model';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { Guid } from 'guid-typescript';
import { UserService } from '../shared/user.service';
import { SelectService } from '../../shared/select.service';
import { MatSnackBar } from '@angular/material';

@Component({
	selector: 'app-user-form',
	templateUrl: './user-form.component.html',
	styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit, OnDestroy {
	// Public properties
	user: User;
	oldUser: User;
	selectedTab: number = 0;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	userForm: FormGroup;
	hasFormErrors: boolean = false;
	errors: any[];
	userRoles: KeyValuePair[];
	// Private properties
	private subscriptions: Subscription[] = [];


	constructor(private activatedRoute: ActivatedRoute,
		private router: Router,
		private userFB: FormBuilder,
		private matSnackBar: MatSnackBar,
		private selectService: SelectService,
		private userService: UserService) { }

	ngOnInit() {
		this.loadUserRoles();
		
		this.loadingSubject.next(true);
		const routeSubscription = this.activatedRoute.params.subscribe(params => {
			const id = params['id'];
			if (id && Guid.isGuid(id)) {

				this.loadingSubject.next(true);
				this.userService.getUser(id)
					.pipe(finalize(() => this.loadingSubject.next(false)))
					.subscribe(res => {
						if (res) {
							this.user = res as User;
							this.oldUser = Object.assign({}, this.user);
							this.initUser();
						}
					});
			} else {
				this.user = new User();
				this.user.clear();
				this.oldUser = Object.assign({}, this.user);
				this.initUser();
			}
		});
		this.subscriptions.push(routeSubscription);
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	initUser() {
		this.createForm();
	}

	resetErrors() {
		this.hasFormErrors = false;
		this.errors = [];
	}

	loadUserRoles() {
		this.loadingSubject.next(true);
		const roleSubscription = this.selectService.getUserRoleSelect()
			.pipe(finalize(() => this.loadingSubject.next(false)))
			.subscribe(data => {
				this.userRoles = data;
			},
			error => {
				this.throwError(error);
			});
		this.subscriptions.push(roleSubscription);
	}

	createForm() {
		this.userForm = this.userFB.group({
			userName: [this.user.userName, Validators.required],
			fullName: [this.user.fullName, Validators.required],
			email: [this.user.email, [Validators.required, Validators.email]],
			phoneNumber: [this.user.phoneNumber],
			address: [this.user.address],
			gender: [this.user.gender],
			userRoleId: [this.user.userRole.id, Validators.required]
		});
	}

	resetAll() {
		this.user = Object.assign({}, this.oldUser);
		this.createForm();
		this.resetErrors();
		this.userForm.markAsPristine();
		this.userForm.markAsUntouched();
		this.userForm.updateValueAndValidity();
	}

	onSumbit() {
		this.resetErrors();
		const controls = this.userForm.controls;
		
		if (this.userForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		const editedUser = this.prepareUser();

		if (editedUser.id && Guid.isGuid(editedUser.id)) {
			this.updateUser(editedUser);
		}
		else {
			this.createUser(editedUser);
		}
	}

	prepareUser(): SaveUser {
		const controls = this.userForm.controls;
		const _user = new SaveUser();
		_user.clear();
		_user.id = this.user.id;
		_user.userName = controls['userName'].value;
		_user.email = controls['email'].value;
		_user.fullName = controls['fullName'].value;
		_user.gender = controls['gender'].value;
		_user.address = controls['address'].value;
		_user.phoneNumber = controls['phoneNumber'].value;
		_user.userRoleId = controls['userRoleId'].value;
		return _user;
	}

	createUser(_user: SaveUser) {
		this.loadingSubject.next(true);
		const createSubscription = this.userService.create(_user)
			.pipe(finalize(() => this.loadingSubject.next(false)))
			.subscribe(res => {
				const message = `New user successfully has been added.`;
				this.matSnackBar.open(message, 'Create');
				this.goBack();
			},
			error => {
				this.throwError(error);
			});
		this.subscriptions.push(createSubscription);
	}

	updateUser(_user: SaveUser) {
		this.loadingSubject.next(true);
		const updateSubscription = this.userService.update(_user)
			.pipe(finalize(() => this.loadingSubject.next(false)))
			.subscribe(res => {
				const message = `User successfully has been saved.`;
				this.matSnackBar.open(message, 'Update');
				this.goBack();
			},
			error => {
				this.throwError(error);
			});
		this.subscriptions.push(updateSubscription);
	}

	getComponentTitle() {
		let result = 'Create user';
		if (!this.user || !this.user.id) {
			return result;
		}

		result = `Edit user - ${this.user.fullName}`;
		return result;
	}
	
	goBack() {
		const url = `/pages/users`;
		this.router.navigate([url], { relativeTo: this.activatedRoute });
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


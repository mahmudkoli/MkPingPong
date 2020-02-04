import { Component, OnInit, OnDestroy, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { UsersDataSource } from '../shared/user.data-source';
import { MatSort, MatPaginator, MatSlideToggleChange, MatDialog, MatSnackBar } from '@angular/material';
import { UserQuery } from '../shared/user.model';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from 'app/shared/shared.service';
import { UserService } from '../shared/user.service';
import { DefaultValue } from 'app/shared/default-value';
import { merge, fromEvent, Subscription, of } from 'rxjs';
import { tap, debounceTime, distinctUntilChanged, take, delay } from 'rxjs/operators';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit, OnDestroy {
	// Table fields
	dataSource: UsersDataSource;
	displayedColumns = ['serial', 'fullName', 'userName', 'email', 'phoneNumber', 'address', 'userRole', 'actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild(MatSort, {static: true}) sort: MatSort;
	// Filter fields
	@ViewChild('fullNameInput', {static: true}) fullNameInput: ElementRef;
	@ViewChild('userNameInput', {static: true}) userNameInput: ElementRef;
	@ViewChild('emailInput', {static: true}) emailInput: ElementRef;

	query: UserQuery;
	PAGE_SIZE: number;

	// Subscriptions
	private subscriptions: Subscription[] = [];

	constructor(
		private router: Router,
		private userService: UserService,
		public dialog: MatDialog,
		private matSnackBar: MatSnackBar) {
			this.PAGE_SIZE = DefaultValue.PAGE_SIZE;
		}

	ngOnInit() {
		this.initSearchEvent();
		this.dataSource = new UsersDataSource(this.userService);
		// this.loadUsersPage();
		// First Load
		of(undefined).pipe(take(1), delay(1000)).subscribe(() => {
			this.loadUsersPage();
		});
	} 
    
	initSearchEvent() {
        // server-side search
        this.callFromEvent(this.fullNameInput.nativeElement,'keyup');
		this.callFromEvent(this.userNameInput.nativeElement,'keyup');
		this.callFromEvent(this.emailInput.nativeElement,'keyup');

        // reset the paginator after sorting
        const sortSubscription = this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
		this.subscriptions.push(sortSubscription);

        // on sort or paginate events, load a new page
        const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page)
        .pipe(
            tap(() => this.loadUsersPage())
        )
        .subscribe();
		this.subscriptions.push(paginatorSubscriptions);
    }

	ngOnDestroy() {
		this.subscriptions.forEach(el => el.unsubscribe());
	}

	callFromEvent(target, event){
		const searchSubscription = fromEvent(target, event)
			.pipe(
				debounceTime(150),
				distinctUntilChanged(),
				tap(() => {
					this.paginator.pageIndex = 0;
					this.loadUsersPage();
				})
			)
			.subscribe();
			this.subscriptions.push(searchSubscription);
	}

    loadUsersPage() {
		this.searchConfiguration();
        this.dataSource.loadUsers(this.query);
	}
	
	searchConfiguration() {
		this.query = new UserQuery({
			page: this.paginator.pageIndex + 1,
			pageSize: this.paginator.pageSize ? this.paginator.pageSize : this.PAGE_SIZE,
			sortBy: this.sort.active ? this.sort.active : 'fullName',
			isSortAscending: this.sort.direction ? (this.sort.direction  == 'asc' ? true : false) : true,
			fullName: this.fullNameInput.nativeElement.value,
			userName: this.userNameInput.nativeElement.value,
			email: this.emailInput.nativeElement.value,
		});
	}

	toggleActiveInactive(id, event: MatSlideToggleChange) {
		const actInSubscription = this.userService.activeInactive(id).subscribe(res => {
			this.loadUsersPage();
		});
		this.subscriptions.push(actInSubscription);
	}

	viewUser(id){
		console.log(`view ${id}`);
	}
	
	editUser(id) {
		this.router.navigate(['/pages/users/edit', id]);
	}
	
	deleteUser(id) {
		const _confirmMessage = 'Are you sure to permanently delete this user?';
       	const _deleteMessage = `User has been deleted`;
       
		const dialogRef = this.dialog.open(FuseConfirmDialogComponent, {
			disableClose: false
		});

		dialogRef.componentInstance.confirmMessage = _confirmMessage;
		const dialogSubscription = dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
   
			this.userService.delete(id).subscribe(data => {
				this.matSnackBar.open(_deleteMessage, 'Delete');
				this.loadUsersPage();
			});
		});
		this.subscriptions.push(dialogSubscription);
	}  
	
	absoluteSerial(indexOnPage: number): number {
		return this.paginator.pageSize * this.paginator.pageIndex + (indexOnPage + 1);
	}
}

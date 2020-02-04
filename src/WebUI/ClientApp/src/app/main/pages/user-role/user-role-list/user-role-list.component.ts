import { SharedService } from './../../../../shared/shared.service';
import { MatPaginator, MatSort, MatDialog, MatSlideToggleChange, MatSnackBar } from '@angular/material';
import { Component, OnInit, ViewChild, ElementRef, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { UserRoleQuery } from '../shared/user-role.model';
import { UserRolesDataSource } from '../shared/user-role.data-source';
import { DefaultValue } from 'app/shared/default-value';
import { ActivatedRoute, Router } from '@angular/router';
import { UserRoleService } from '../shared/user-role.service';
import { merge, fromEvent, of, Subscription } from 'rxjs';
import { tap, debounceTime, distinctUntilChanged, take, delay } from 'rxjs/operators';
import { UserRoleFormComponent } from '../user-role-form/user-role-form.component';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-user-role-list',
  templateUrl: './user-role-list.component.html',
  styleUrls: ['./user-role-list.component.scss']
})
export class UserRoleListComponent implements OnInit, OnDestroy {
  // Table fields
  dataSource: UserRolesDataSource;
  displayedColumns = ['serial', 'name', 'actions'];
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  // Filter fields
  @ViewChild('nameInput', {static: true}) nameInput: ElementRef;
  
  query: UserRoleQuery;
  PAGE_SIZE: number;

	// Subscriptions
	private subscriptions: Subscription[] = [];
  
  constructor(private userRoleService: UserRoleService,
      public dialog: MatDialog,
      private matSnackBar: MatSnackBar) {
      this.PAGE_SIZE = DefaultValue.PAGE_SIZE;
    }
  
  ngOnInit() {
		this.initSearchEvent();
    this.dataSource = new UserRolesDataSource(this.userRoleService);
    // this.loadUserRolesPage();
		// First Load
		of(undefined).pipe(take(1), delay(1000)).subscribe(() => {
			this.loadUserRolesPage();
		});
  }
    
  initSearchEvent() {
        // server-side search
        this.callFromEvent(this.nameInput.nativeElement,'keyup');
  
        // reset the paginator after sorting
        const sortSubscription = this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
		    this.subscriptions.push(sortSubscription);
  
        // on sort or paginate events, load a new page
        const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page)
        .pipe(
            tap(() => this.loadUserRolesPage())
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
          this.loadUserRolesPage();
        })
      )
      .subscribe();
			this.subscriptions.push(searchSubscription);
  }
  
  loadUserRolesPage() {
    this.searchConfiguration();
    this.dataSource.loadUserRoles(this.query);
  }
	
	searchConfiguration() {
    this.query = new UserRoleQuery({
      page: this.paginator.pageIndex+1,
      pageSize: this.paginator.pageSize ? this.paginator.pageSize : this.PAGE_SIZE,
      sortBy: this.sort.active ? this.sort.active : 'name',
      isSortAscending: this.sort.direction ? (this.sort.direction  == 'asc' ? true : false) : true,
      name: this.nameInput.nativeElement.value,
    });
	}
  
  toggleActiveInactive(id, event: MatSlideToggleChange) {
    const actInSubscription = this.userRoleService.activeInactive(id).subscribe(res => {
        this.loadUserRolesPage();
    });
		this.subscriptions.push(actInSubscription);
  }
  
  addUserRole(){
    this.addOrEditUserRole();
  }
  
  viewUserRole(id){
    console.log(`view ${id}`);
  }
  
  editUserRole(id) {
    this.addOrEditUserRole(id);
  }
  
  addOrEditUserRole(id?) {
    const _saveMessage = `User role successfully has been saved.`;
    const _messageType = id ? "Update" : "Create";

    const dialogRef = this.dialog.open(UserRoleFormComponent, { 
      disableClose: false,
      width: '900px',
      height: 'auto',
      data: { userRoleId: id } 
    });
    const dialogSubscription = dialogRef.afterClosed().subscribe(res => {
      if (!res) {
        return;
      }

      this.matSnackBar.open(_saveMessage, _messageType);
      this.loadUserRolesPage();
    });
		this.subscriptions.push(dialogSubscription);
  }
  
  deleteUserRole(id) {
      const _deleteMessage = `User role has been deleted`;
      const _confirmMessage = 'Are you sure to permanently delete this user role?';

      const dialogRef = this.dialog.open(FuseConfirmDialogComponent, {
          disableClose: false
      });
      dialogRef.componentInstance.confirmMessage = _confirmMessage;

      const dialogSubscription = dialogRef.afterClosed().subscribe(res => {
          if (!res) {
            return;
          }
          
          this.userRoleService.delete(id).subscribe(data => {
            this.matSnackBar.open(_deleteMessage, 'Delete');
            this.loadUserRolesPage();
          });
      });
      this.subscriptions.push(dialogSubscription);
  }
  
  absoluteSerial(indexOnPage: number): number {
    return this.paginator.pageSize * this.paginator.pageIndex + (indexOnPage + 1);
  }
}

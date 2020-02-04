import { UserRole, UserRoleQuery } from './user-role.model';
import { QueryResult } from '../../shared/query-result.model';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { DataSource } from '@angular/cdk/table';
import { CollectionViewer } from '@angular/cdk/collections';
import { catchError, finalize, distinctUntilChanged, skip } from 'rxjs/operators';
import { UserRoleService } from './user-role.service';

export class UserRolesDataSource implements DataSource<UserRole> {

    private userRolesSubject = new BehaviorSubject<UserRole[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);
    private totalItemsSubject = new BehaviorSubject<number>(0);

    public loading$ = this.loadingSubject.asObservable();
	public totalItems$ = this.totalItemsSubject.asObservable();
	public items$ = this.userRolesSubject.asObservable();
	public isPreloadTextViewed$: Observable<boolean> = of(true);
    public hasItems: boolean = true;

    constructor(private userRoleService: UserRoleService) {
        this.totalItems$.pipe(
            distinctUntilChanged(),
            skip(1)
        ).subscribe(res => this.hasItems = res > 0);
    }

    connect(collectionViewer: CollectionViewer): Observable<UserRole[]> {
        return this.userRolesSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.userRolesSubject.complete();
        this.loadingSubject.complete();
        this.totalItemsSubject.complete();
    }

    loadUserRoles(query: UserRoleQuery) {
        this.loadingSubject.next(true);
        this.userRoleService.getUserRoles(query).pipe(
            catchError(() => of([])),
            finalize(() => {
                this.loadingSubject.next(false);
                this.isPreloadTextViewed$ = of(false);
            })
        )
        .subscribe(data => {
            const result = data as QueryResult;
            this.userRolesSubject.next(result.items);
            this.totalItemsSubject.next(result.totalItems);
        });
    }
}

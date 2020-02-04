import { QueryResult } from './../../shared/query-result.model';
import { User, UserQuery } from './user.model';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { DataSource } from '@angular/cdk/table';
import { UserService } from './user.service';
import { CollectionViewer } from '@angular/cdk/collections';
import { catchError, finalize, distinctUntilChanged, skip } from 'rxjs/operators';

export class UsersDataSource implements DataSource<User> {

    private usersSubject = new BehaviorSubject<User[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);
    private totalItemsSubject = new BehaviorSubject<number>(0);

    public loading$ = this.loadingSubject.asObservable();
	public totalItems$ = this.totalItemsSubject.asObservable();
	public items$ = this.usersSubject.asObservable();
	public isPreloadTextViewed$: Observable<boolean> = of(true);
    public hasItems: boolean = true;

	private subscriptions: Subscription[] = [];

    constructor(private userService: UserService) {
        const totalItemsSubscription = this.totalItems$.pipe(
            distinctUntilChanged(),
            skip(1)
        )
        .subscribe(res => this.hasItems = res > 0);
        
        this.subscriptions.push(totalItemsSubscription);
    }

    connect(collectionViewer: CollectionViewer): Observable<User[]> {
        return this.usersSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.usersSubject.complete();
        this.loadingSubject.complete();
        this.totalItemsSubject.complete();
		this.subscriptions.forEach(sb => sb.unsubscribe());
    }

    loadUsers(query: UserQuery) {
        this.loadingSubject.next(true);
        const getUsersSubscription = this.userService.getUsers(query).pipe(
            catchError(() => of([])),
            finalize(() => {
                this.loadingSubject.next(false);
                this.isPreloadTextViewed$ = of(false);
            })
        )
        .subscribe(data => {
            const result = data as QueryResult;
            this.usersSubject.next(result.items);
            this.totalItemsSubject.next(result.totalItems);
        });

        this.subscriptions.push(getUsersSubscription);
    }
}

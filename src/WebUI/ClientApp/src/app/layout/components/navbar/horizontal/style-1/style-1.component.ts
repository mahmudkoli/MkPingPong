import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { filter, takeUntil, map } from 'rxjs/operators';

import { FuseConfigService } from '@fuse/services/config.service';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { AuthorizeService } from 'api-authorization/authorize.service';
import { navigation } from 'app/navigation/navigation';

@Component({
    selector     : 'navbar-horizontal-style-1',
    templateUrl  : './style-1.component.html',
    styleUrls    : ['./style-1.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NavbarHorizontalStyle1Component implements OnInit, OnDestroy
{
    fuseConfig: any;
    navigation: any;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {FuseConfigService} _fuseConfigService
     * @param {FuseNavigationService} _fuseNavigationService
     * @param {FuseSidebarService} _fuseSidebarService
     */
    constructor(
        private _fuseConfigService: FuseConfigService,
        private _fuseNavigationService: FuseNavigationService,
        private _fuseSidebarService: FuseSidebarService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _titleService: Title,
        private _authorizeService: AuthorizeService
    )
    {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Get current navigation
        this._fuseNavigationService.onNavigationChanged
            .pipe(
                filter(value => value !== null),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                this.navigation = this._fuseNavigationService.getCurrentNavigation();
            });

        // Subscribe to the config changes
        this._fuseConfigService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config) => {
                this.fuseConfig = config;
            });

        // load permission base menu hide/show
        this._authorizeService.getUser()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user) => {
                if(user)
                    this.loadFilterMenu();
            });

        // set dynamic title
        this.setBrowserTitle();
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    loadFilterMenu() {
        // permission wise menu hide or show 
        const baseItems = navigation;

        baseItems.forEach((base) => {
            const menuItems = base.children;
            const filterMenuItems: any[] = [];
            
            if(!(!menuItems || menuItems.length === 0)) {
                menuItems.forEach((root) => {
                    if(root.children && root.children.length > 0) {
                        const submenu: any[] = [];
                        root.children.forEach((child) => {
                            if(!child.permissions || this._authorizeService.hasPermission(child.permissions as Array<string>)) {
                                submenu.push(child);
                            }
                        });
                        root.children = submenu;
                        if(root.children && root.children.length > 0) {
                            filterMenuItems.push(root);
                        }
                    } else if(!root.permissions || this._authorizeService.hasPermission(root.permissions as Array<string>)) {
                        filterMenuItems.push(root);
                    }
                });
            }
            
            base.children = filterMenuItems;
        });

        // set filter menu
        this.navigation = baseItems;

        // Unregister the navigation if exists
        this._fuseNavigationService.unregister('filter');

        // Register the navigation to the service
        this._fuseNavigationService.register('filter', this.navigation);

        // Set the filter navigation as our current navigation
        this._fuseNavigationService.setCurrentNavigation('filter');
    }

	setBrowserTitle() {
		this._router.events.pipe(
			filter(event => event instanceof NavigationEnd),
			map(() => {
				let child = this._route.firstChild;
				while (child) {
				  if (child.firstChild) {
					child = child.firstChild;
				  } else if (child.snapshot.data && child.snapshot.data['title']) {
					return child.snapshot.data['title'];
				  } else {
					return "Index";
				  }
				}
				return "Index";
			}),
		  )
		  .subscribe((title: string) => {
			this._titleService.setTitle(`${title} | MkPingPong`);
		  });
	}
}

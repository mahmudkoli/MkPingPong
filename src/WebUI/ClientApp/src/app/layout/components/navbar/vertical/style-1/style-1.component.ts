import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router, ActivatedRoute } from '@angular/router';
import { Subject, Observable } from 'rxjs';
import { delay, filter, take, takeUntil, map } from 'rxjs/operators';

import { FuseConfigService } from '@fuse/services/config.service';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { FusePerfectScrollbarDirective } from '@fuse/directives/fuse-perfect-scrollbar/fuse-perfect-scrollbar.directive';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { AuthorizeService } from 'api-authorization/authorize.service';
import { Title } from '@angular/platform-browser';
import { navigation } from 'app/navigation/navigation';

@Component({
    selector     : 'navbar-vertical-style-1',
    templateUrl  : './style-1.component.html',
    styleUrls    : ['./style-1.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NavbarVerticalStyle1Component implements OnInit, OnDestroy
{
    fuseConfig: any;
    navigation: any;


    name: Observable<string>;
    email: Observable<string>;
    imageUrl: Observable<string>;

    // Private
    private _fusePerfectScrollbar: FusePerfectScrollbarDirective;
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {FuseConfigService} _fuseConfigService
     * @param {FuseNavigationService} _fuseNavigationService
     * @param {FuseSidebarService} _fuseSidebarService
     * @param {Router} _router
     */
    constructor(
        private _fuseConfigService: FuseConfigService,
        private _fuseNavigationService: FuseNavigationService,
        private _fuseSidebarService: FuseSidebarService,
        private _router: Router,
        private _authorizeService: AuthorizeService,
        private _route: ActivatedRoute,
        private _titleService: Title
    )
    {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    // Directive
    @ViewChild(FusePerfectScrollbarDirective, {static: true})
    set directive(theDirective: FusePerfectScrollbarDirective)
    {
        if ( !theDirective )
        {
            return;
        }

        this._fusePerfectScrollbar = theDirective;

        // Update the scrollbar on collapsable item toggle
        this._fuseNavigationService.onItemCollapseToggled
            .pipe(
                delay(500),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                this._fusePerfectScrollbar.update();
            });

        // Scroll to the active item position
        this._router.events
            .pipe(
                filter((event) => event instanceof NavigationEnd),
                take(1)
            )
            .subscribe(() => {
                    setTimeout(() => {
                        this._fusePerfectScrollbar.scrollToElement('navbar .nav-link.active', -120);
                    });
                }
            );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this._router.events
            .pipe(
                filter((event) => event instanceof NavigationEnd),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                    if ( this._fuseSidebarService.getSidebar('navbar') )
                    {
                        this._fuseSidebarService.getSidebar('navbar').close();
                    }
                }
            );

        // Subscribe to the config changes
        this._fuseConfigService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config) => {
                this.fuseConfig = config;
            });

        // Get current navigation
        this._fuseNavigationService.onNavigationChanged
            .pipe(
                filter(value => value !== null),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                this.navigation = this._fuseNavigationService.getCurrentNavigation();
            });

        // load logged user info
        this.loadLoggedUserInfo();

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

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle sidebar opened status
     */
    toggleSidebarOpened(): void
    {
        this._fuseSidebarService.getSidebar('navbar').toggleOpen();
    }

    /**
     * Toggle sidebar folded status
     */
    toggleSidebarFolded(): void
    {
        this._fuseSidebarService.getSidebar('navbar').toggleFold();
    }

    private loadLoggedUserInfo() {
        this.name = this._authorizeService.getUser().pipe(map(user => user && user.full_name));
        this.email = this._authorizeService.getUser().pipe(map(user => user && user.email));
        this.imageUrl = this._authorizeService.getUser()
            .pipe(map(user => user && 
                (user.image_url ? './uploads/' + user.image_url : './assets/images/avatars/profile.jpg')
            ));
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

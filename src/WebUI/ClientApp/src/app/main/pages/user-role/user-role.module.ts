import { MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { FuseSharedModule } from './../../../../@fuse/shared.module';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UserRoleService } from './shared/user-role.service';
import { UserRoleRoutingModule } from './user-role-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserRoleComponent } from './user-role.component';
import { UserRoleFormComponent } from './user-role-form/user-role-form.component';
import { UserRoleListComponent } from './user-role-list/user-role-list.component';
import { MatTableModule, MatPaginatorModule, MatSortModule, MatSnackBarModule, MatChipsModule, MatExpansionModule, MatFormFieldModule, MatRippleModule, MatSelectModule, MatTabsModule, MatProgressSpinnerModule, MatCardModule, MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material';
import { RolePermissionsData } from './shared/user-role-permission-data';
import { FuseConfirmDialogModule } from '@fuse/components';



@NgModule({
  declarations: [
    UserRoleComponent, 
    UserRoleFormComponent, 
    UserRoleListComponent
  ],
  imports: [
    UserRoleRoutingModule,
    
    MatButtonModule,
    MatChipsModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatRippleModule,
    MatSelectModule,
    MatSortModule,
    MatSnackBarModule,
    MatTableModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatCardModule,
    MatCheckboxModule,
    MatTooltipModule,

    FuseSharedModule,
    FuseConfirmDialogModule,
  ],
  providers: [
    UserRoleService,
		// {
		// 	provide: MAT_DIALOG_DEFAULT_OPTIONS,
		// 	useValue: {
		// 		hasBackdrop: true,
		// 		// panelClass: 'kt-mat-dialog-container__wrapper',
		// 		height: 'auto',
		// 		width: '900px'
		// 	}
    // },
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, 
      useValue: {
        verticalPosition: 'bottom',
        duration        : 2000
      }
    },
    RolePermissionsData,
  ],
	entryComponents: [
    UserRoleFormComponent,
	],
})
export class UserRoleModule { }

import { UserComponent } from './user.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserRoutingModule } from './user-routing.module';
import { UserFormComponent } from './user-form/user-form.component';
import { UserListComponent } from './user-list/user-list.component';
import { UserService } from './shared/user.service';
import { MatButtonModule, MatChipsModule, MatExpansionModule, MatFormFieldModule, MatIconModule, MatInputModule, MatPaginatorModule, MatRippleModule, MatSelectModule, MatSortModule, MatSnackBarModule, MatTableModule, MatTabsModule, MatSlideToggleModule, MatProgressSpinnerModule, MatDialogModule, MatCardModule, MatCheckboxModule, MatTooltipModule, MatMenuModule } from '@angular/material';
import { FuseConfirmDialogModule } from '@fuse/components';
import { FuseSharedModule } from '@fuse/shared.module';
import { SelectService } from '../shared/select.service';
import { UserChangePasswordComponent } from './user-form/tabs/user-change-password/user-change-password.component';
import { UserImageUploadComponent } from './user-form/tabs/user-image-upload/user-image-upload.component';



@NgModule({
  declarations: [
    UserComponent, 
    UserFormComponent, 
    UserListComponent, UserChangePasswordComponent, UserImageUploadComponent
  ],
  imports: [
    UserRoutingModule,
    
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
    MatMenuModule,

    FuseSharedModule,
    FuseConfirmDialogModule,
  ],
  providers: [
    UserService,
    SelectService
  ]
})
export class UserModule { }

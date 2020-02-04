import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { UserComponent } from './user.component';
import { UserListComponent } from './user-list/user-list.component';
import { UserFormComponent } from './user-form/user-form.component';
import { AuthorizeGuard } from 'api-authorization/authorize.guard';
import { RolePermissions } from 'app/shared/user-role-permission';


const routes: Routes = [{
  path: 'users',
  component: UserComponent,
  canActivate: [AuthorizeGuard],
  children: [
    {
      path: '',
      redirectTo: 'users',
      pathMatch: 'full',
    },
    {
      path: 'users',
      component: UserListComponent,
      canActivate: [AuthorizeGuard],
      data: { title: 'Users', permissions: [RolePermissions.SuperAdmin, RolePermissions.Users.ListView] },
    },
    {
      path: 'new',
      component: UserFormComponent,
      canActivate: [AuthorizeGuard],
      data: { title: 'New User', permissions: [RolePermissions.SuperAdmin, RolePermissions.Users.Create] },
    },
    {
      path: 'edit/:id',
      component: UserFormComponent,
      canActivate: [AuthorizeGuard],
      data: { title: 'Edit User', permissions: [RolePermissions.SuperAdmin, RolePermissions.Users.Edit] },
    },
  ],
}];


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule],
})
export class UserRoutingModule { }

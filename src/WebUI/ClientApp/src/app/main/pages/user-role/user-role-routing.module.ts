import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { UserRoleComponent } from './user-role.component';
import { UserRoleListComponent } from './user-role-list/user-role-list.component';
import { AuthorizeGuard } from 'api-authorization/authorize.guard';
import { RolePermissions } from 'app/shared/user-role-permission';

const routes: Routes = [{
  path: 'userroles',
  component: UserRoleComponent,
  canActivate: [AuthorizeGuard],
  children: [
    {
      path: '',
      redirectTo: 'userroles',
      pathMatch: 'full',
    },
    {
      path: 'userroles',
      component: UserRoleListComponent,
      canActivate: [AuthorizeGuard],
      data: { title: 'User Roles', permissions: [RolePermissions.SuperAdmin, RolePermissions.UserRoles.ListView] },
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
export class UserRoleRoutingModule { }

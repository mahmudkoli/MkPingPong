import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AuthorizeGuard } from 'api-authorization/authorize.guard';

const routes: Routes = [
  {
      path        : 'pages',
      canActivate: [AuthorizeGuard],
      loadChildren: './main/pages/pages.module#PagesModule'
  },
  {
      path      : '**',
      redirectTo: 'pages/errors/error-404'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

import { UserRoleModule } from './user-role/user-role.module';
import { UserModule } from './user/user.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Error404Module } from './errors/404/error-404.module';
import { Error500Module } from './errors/500/error-500.module';
import { FaqModule } from './faq/faq.module';
import { UserComponent } from './user/user.component';
import { Error403Module } from './errors/403/error-403.module';



@NgModule({
  declarations: [],
  imports: [
    // Errors
    Error403Module,
    Error404Module,
    Error500Module,

    // Faq
    FaqModule,

    UserModule,
    UserRoleModule
  ]
})
export class PagesModule { }

import { Guid } from 'guid-typescript';
import { Injectable } from '@angular/core';
import { SharedService } from 'app/shared/shared.service';
import { HttpClient } from '@angular/common/http';
import { SaveUserRole } from './user-role.model';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserRoleService {
  
  private readonly userRolesEndpoint = environment.API_BASE_URL + '/api/userroles';

  constructor(private http: HttpClient, private sharedService: SharedService) { }

  create(userRole: SaveUserRole) {
    userRole.id = Guid.EMPTY;
    return this.http.post(this.userRolesEndpoint, userRole);
  }

  getUserRole(id) {
    return this.http.get(this.userRolesEndpoint + '/' + id);
  }

  getUserRoles(filter?) {
    return this.http.get(this.userRolesEndpoint + '?' + this.sharedService.toQueryString(filter));
  }

  update(userRole: SaveUserRole) {
    return this.http.put(this.userRolesEndpoint + '/' + userRole.id, userRole);
  }

  delete(id) {
    return this.http.delete(this.userRolesEndpoint + '/' + id);
  }

  activeInactive(id) {
    return this.http.post(`${this.userRolesEndpoint}/${id}/activeInactive`, null);
  }

}

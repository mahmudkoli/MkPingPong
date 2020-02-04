import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SharedService } from 'app/shared/shared.service';
import { SaveUser, UserChangePassword, UserImageUpload } from './user.model';
import { Guid } from 'guid-typescript';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly usersEndpoint = environment.API_BASE_URL + '/api/users';

  constructor(private http: HttpClient, private shared: SharedService) { }

  create(user: SaveUser) {
    user.id = Guid.EMPTY;
    return this.http.post(this.usersEndpoint, user);
  }

  getUser(id) {
    return this.http.get(this.usersEndpoint + '/' + id);
  }

  getUsers(filter?) {
    return this.http.get(this.usersEndpoint + '?' + this.shared.toQueryString(filter));
  }

  update(user: SaveUser) {
    return this.http.put(this.usersEndpoint + '/' + user.id, user);
  }

  activeInactive(id) {
    return this.http.post(`${this.usersEndpoint}/${id}/activeInactive`, null);
  }

  delete(id) {
    return this.http.delete(this.usersEndpoint + '/' + id);
  }

  userChangePassword(userPassword: UserChangePassword) {
    return this.http.post(`${this.usersEndpoint}/${userPassword.id}/changePassword`, userPassword);
  }

  userImageUpload(userImage: UserImageUpload) {
    return this.http.post(`${this.usersEndpoint}/${userImage.id}/imageUpload`, this.shared.toFormData(userImage));
  }

}

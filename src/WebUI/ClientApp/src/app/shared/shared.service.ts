import { Guid } from 'guid-typescript';
import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  constructor(private titleService: Title) { }

  
  toQueryString(obj) {
    // tslint:disable-next-line: prefer-const
    let parts = [];
    // tslint:disable-next-line: forin
    for (const property in obj) {
      const value = obj[property];
      if (value != null && value !== undefined) {
        parts.push(encodeURIComponent(property) + '=' + encodeURIComponent(value));
      }
    }

    return parts.join('&');
  }

  toFormData(obj) {
    // tslint:disable-next-line: prefer-const
    let formData = new FormData();
    // tslint:disable-next-line: forin
    for (const property in obj) {
      const value = obj[property];
      if (value != null && value !== undefined) {
        formData.append(property, value);
      }
    }

    return formData;
  }
  
	isValidGuid(value): Boolean {
		return value ? (Guid.isGuid(value) && Guid.EMPTY != value ? true : false) : false;
	}
  
  getTitle()
  {
    return this.titleService.getTitle();
  }

  setTitle(title: string)
  {
    this.titleService.setTitle(title);
  }

}

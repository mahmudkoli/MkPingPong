import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, catchError, retry } from "rxjs/operators";
import { throwError, Observable } from "rxjs";
import { Guid } from "guid-typescript";
import { KeyValuePair } from "./key-value-pair.model";

@Injectable({
	providedIn: "root"
})
export class SelectService {
	private readonly selectEndpoint = "/api/select";

	constructor(private http: HttpClient) {}

	getUserRoleSelect(): Observable<KeyValuePair[]> {
		return this.http.get(`${this.selectEndpoint}/userroles`).pipe(map(data => data as KeyValuePair[]));
	}
}

import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { UserImageUpload } from '../../../shared/user.model';
import { FormBuilder } from '@angular/forms';
import { UserService } from '../../../shared/user.service';
import { SharedService } from 'app/shared/shared.service';
import { MatSnackBar } from '@angular/material';
import { finalize } from 'rxjs/operators';
import { DefaultValue } from 'app/shared/default-value';

@Component({
  selector: 'app-user-image-upload',
  templateUrl: './user-image-upload.component.html',
  styleUrls: ['./user-image-upload.component.scss']
})
export class UserImageUploadComponent implements OnInit {
	// Public properties
	@Input() userId: string;
	@Input() imageUrl: string;
	@Input() loadingSubject: BehaviorSubject<boolean>;
	@ViewChild('inputFile', { static: false }) inputFile: ElementRef;
	hasFormErrors: boolean = false;
	userImage: UserImageUpload;
	errors: any[];
	imageError: string;
	// Private properties
	private subscriptions: Subscription[] = [];

	constructor(private userService: UserService,
    	private matSnackBar: MatSnackBar) { }

	ngOnInit() {
		if (!this.loadingSubject.value)
			this.loadingSubject.next(false);
		this.resetAll();
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	loadInitData() {
		this.userImage.id = this.userId;
		this.userImage.imageUrl = this.imageUrl ? './uploads/' + this.imageUrl : '';
	}

	resetErrors() {
		this.hasFormErrors = false;
		this.errors = [];
	}

	resetAll() {
		this.userImage = new UserImageUpload();
		this.userImage.clear();
		this.loadInitData();
		this.hasFormErrors = false;
		this.resetErrors();
	}

	onSubmit() {
		this.resetErrors();

		this.loadingSubject.next(true);
		this.userService.userImageUpload(this.userImage)
			.pipe(finalize(() => this.loadingSubject.next(false)))
			.subscribe((data: any) => {
				if (data) {
					this.userImage.imageUrl = './uploads/' + data.imageUrl;
					this.userImage.inputFile = null;
					const message = `User image has been successfully uploaded.`;
          			this.matSnackBar.open(message, 'Upload');;
				}
			},
			error => {
				this.throwError(error);
			});

		this.resetAll();
	}

	// for Image --- start
	onChangeInputFile(event: any) {
		if (event.target.files && event.target.files[0]) {
			const reader = new FileReader();
			const file = event.target.files[0];
			if (!this.isValidImage(file)) return;
			this.userImage.inputFile = this.inputFile.nativeElement.files[0];
			reader.onload = (loadEvent: any) => {
				this.userImage.imageUrl = loadEvent.target.result;
			};
			reader.readAsDataURL(file);
		} else {
			this.userImage.inputFile = null;
			this.userImage.imageUrl = '';
		}
	}

	isValidImage(file) {
		const fileExt = '.' + file.name.split('.').pop().toLowerCase();
		if (!(DefaultValue.PhotoSettings.AcceptedFileTypes.indexOf(fileExt) > -1)) {
			this.imageError = 'Invalid file type.';
			this.userImage.inputFile = null;
			this.userImage.imageUrl = '';
			return false;
		}
		if (file.size > DefaultValue.PhotoSettings.MaxBytes) {
			this.imageError = 'Max file size exceeded';
			this.userImage.inputFile = null;
			this.userImage.imageUrl = '';
			return false;
		}
		this.imageError = '';
		return true;
	}

	onRemoveInputFile() {
		this.userImage.inputFile = null;
		this.userImage.imageUrl = '';
	}
	// for Image --- end


	onAlertClose($event) {
		this.resetErrors();
	}

	throwError(error) {
		this.hasFormErrors = true;
		this.errors.push(error.error.message || error.error.title || error.error || error.statusText);
		console.error(error);
	}

	isUserImageValid(): boolean {
		return (this.userImage && this.userImage.id && this.userImage.inputFile && this.isValidImage(this.userImage.inputFile));
	}
}


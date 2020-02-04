import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { SaveUserRole, UserRole } from '../shared/user-role.model';
import { ISaveRolePermission, RolePermissionsData } from '../shared/user-role-permission-data';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { UserRoleService } from '../shared/user-role.service';
import { each, some, find } from 'lodash';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-role-form',
  templateUrl: './user-role-form.component.html',
  styleUrls: ['./user-role-form.component.scss']
})
export class UserRoleFormComponent implements OnInit, OnDestroy {
  // Public properties
  userRole: SaveUserRole;
  userRoleId: any;
  hasFormErrors: boolean = false;
	errors: any[];
  viewLoading: boolean = false;
  loadingAfterSubmit: boolean = false;
  rolePermissions: ISaveRolePermission[];
  // Private properties
	private subscriptions: Subscription[] = [];

  constructor(public dialogRef: MatDialogRef<UserRoleFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private rolePermissionsData: RolePermissionsData,
    private userRoleService: UserRoleService) { }

  ngOnInit() {
    this.loadInitData();

    if (this.userRoleId) {
      const roleSubscriptions = this.userRoleService.getUserRole(this.userRoleId).subscribe(data => {
        this.userRole = data as SaveUserRole;
        this.loadRolePermissions();
      });
      this.subscriptions.push(roleSubscriptions);
    } else {
      this.userRole = new UserRole();
      this.userRole.clear();
    }
  }

  ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
  }

  loadInitData() {
    this.userRoleId = this.data.userRoleId;
    this.rolePermissions = [];
    this.rolePermissions = this.rolePermissionsData.items;
    this.resetRolePermissions();
  }

  loadRolePermissions() {
      if (!this.rolePermissions || this.rolePermissions.length===0 || !this.userRole.permissions || this.userRole.permissions.length===0) {
        return;
      }

      this.rolePermissions.forEach(root => {
        let isRootSelect = true;
        root._children.forEach(child => {
          if(this.userRole.permissions.some(per => per == child.name)) child.isSelected = true;
          if(!child.isSelected) isRootSelect = false;
        });
        root.isSelected = isRootSelect;
      });
  }

  resetRolePermissions() {
    if (!this.rolePermissions || this.rolePermissions.length===0) {
      return;
    }

    this.rolePermissions.forEach(root => {
      root.isSelected = false;
      root._children.forEach(child => {
         child.isSelected = false;
      });
    });
  }

  preparePermissions(): string[] {
    const result = [];
    each(this.rolePermissions, (_root: ISaveRolePermission) => {
        each(_root._children, (_child: ISaveRolePermission) => {
          if (_child.isSelected) {
            result.push(_child.name);
          }
        });
    });
    return result;
  }

  prepareRole(): SaveUserRole {
    const _role = new SaveUserRole ();
    _role.clear();
    _role.id = this.userRole.id;
    _role.name = this.userRole.name;
    _role.permissions = this.preparePermissions();
    _role.isDeleted = this.userRole.isDeleted;
    _role.isActive = this.userRole.isActive;
    return _role;
  }

  onSubmit() {
    this.resetErrors();
    this.loadingAfterSubmit = false;
    this.viewLoading = false;
    
    if (!this.isRoleNameValid()) {
      this.hasFormErrors = true;
			this.errors.push('Oh snap! Invalid role name.');
      return;
    }

    const editedRole = this.prepareRole();
    if (editedRole.id) {
      this.updateRole(editedRole);
    } else {
      this.createRole(editedRole);
    }
  }

  updateRole(_role: SaveUserRole) {
    this.resetErrors();
    this.loadingAfterSubmit = true;
    this.viewLoading = true;
    
    const updateSubscription = this.userRoleService.update(_role).subscribe(() => { 
      this.viewLoading = false;
      this.dialogRef.close({_role, isEdit: true});
    },
    error => {
      this.throwError(error);
    }); 
		this.subscriptions.push(updateSubscription);
  }

  createRole(_role: SaveUserRole) {
    this.resetErrors();
    this.loadingAfterSubmit = true;
    this.viewLoading = true;

    const createSubscription = this.userRoleService.create(_role).subscribe(res => {
      if (!res) {
        return;
      }

      this.viewLoading = false;
      this.dialogRef.close({_role, isEdit: false});
    },
    error => {
      this.throwError(error);
    });
		this.subscriptions.push(createSubscription);
  }

	resetErrors() {
		this.hasFormErrors = false;
		this.errors = [];
	}

  isSelectedChanged($event, permission: ISaveRolePermission) {
    if ((!permission._children || permission._children.length === 0) && permission.isSelected) {
      const _root = find(this.rolePermissions, (item: ISaveRolePermission) => item.id === permission.parentId);
      // if (_root && !_root.isSelected) {
      //   _root.isSelected = true;
      // }
      if (_root && _root._children && !some(_root._children, (item: ISaveRolePermission) => !item.isSelected)) {
        _root.isSelected = true;
      }
      else {
        _root.isSelected = false;
      }
      return;
    }

    if ((!permission._children || permission._children.length === 0) && !permission.isSelected) {
      const _root = find(this.rolePermissions, (item: ISaveRolePermission) => item.id === permission.parentId);
      // if (_root && _root.isSelected) {
      //   if (!some(_root._children, (item: ISaveRolePermission) => item.isSelected === true)) {
      //     _root.isSelected = false;
      //   }
      // }
        if (_root) _root.isSelected = false;
      return;
    }

    if (permission._children.length > 0 && permission.isSelected) {
      each(permission._children, (item: ISaveRolePermission) => item.isSelected = true);
      return;
    }

    if (permission._children.length > 0 && !permission.isSelected) {
      each(permission._children, (item: ISaveRolePermission) => {
        item.isSelected = false;
      });
      return;
    }
  }

  getRoleName(): string {
    if (this.userRole && this.userRole.id) {
      return `Edit role '${this.userRole.name}'`;
    }
    return 'New role';
  }

  isRoleNameValid(): boolean {
    return (this.userRole && this.userRole.name && this.userRole.name.length > 0);
  }

	onAlertClose($event) {
		this.resetErrors();
	}

	throwError(error) {
		this.hasFormErrors = true;
		this.errors.push(error.error.message || error.error.title || error.error || error.statusText);
		console.error(error);
	}

}

import { KeyValuePair } from './../../shared/key-value-pair.model';
import { Entity } from '../../shared/entity.model';
import { Auditable } from '../../shared/auditable.model';
import { QueryObject } from '../../shared/query-object.model';

export class User extends Auditable {
    fullName: string;
    userName: string;
    email: string;
    phoneNumber: string;
    gender: string;
    address: string;
    userRole: KeyValuePair;
    imageUrl: string;
    
    constructor(init?: Partial<User>) {
        super();
        Object.assign(this, init);
    }

    clear() {
        super.clear();
        this.fullName = '';
        this.userName = '';
        this.email = '';
        this.phoneNumber = '';
        this.gender = '';
        this.address = '';
        this.userRole = new KeyValuePair();
        this.userRole.clear();
        this.imageUrl = '';
    }
}

export class SaveUser extends Entity {
    fullName: string;
    userName: string;
    email: string;
    phoneNumber: string;
    gender: string;
    address: string;
    userRoleId: string;
    
    constructor(init?: Partial<SaveUser>) {
        super();
        Object.assign(this, init);
    }

    clear() {
        super.clear();
        this.fullName = '';
        this.userName = '';
        this.email = '';
        this.phoneNumber = '';
        this.gender = '';
        this.address = '';
        this.userRoleId = '';
    }
}

export class UserQuery extends QueryObject {
    fullName: string;
    userName: string;
    email: string;
    
    constructor(init?: Partial<UserQuery>) {
        super();
        Object.assign(this, init);
    }

    clear() {
        this.fullName = '';
        this.userName = '';
        this.email = '';
    }
}

export class UserChangePassword extends Entity {
    newPassword: string;
    
    constructor(init?: Partial<UserChangePassword>) {
        super();
        Object.assign(this, init);
    }

    clear() {
        super.clear();
        this.newPassword = '';
    }
}

export class UserImageUpload extends Entity {
    imageUrl: string;
    inputFile: File;
    
    constructor(init?: Partial<UserImageUpload>) {
        super();
        Object.assign(this, init);
    }

    clear() {
        super.clear();
        this.imageUrl = '';
        this.inputFile = null;
    }
}

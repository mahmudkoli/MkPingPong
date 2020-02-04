import { Entity } from '../../shared/entity.model';
import { Auditable } from '../../shared/auditable.model';
import { QueryObject } from '../../shared/query-object.model';

export class UserRole extends Auditable {
    name: string;
    permissions: string[];
    
    constructor(init?: Partial<UserRole>) {
        super();
        Object.assign(this, init);
    }

    clear() {
        super.clear();
        this.name = '';
        this.permissions = [];
    }
}

export class SaveUserRole extends Entity {
    name: string;
    permissions: string[];
    
    constructor(init?: Partial<SaveUserRole>) {
        super();
        Object.assign(this, init);
    }

    clear() {
        super.clear();
        this.name = '';
        this.permissions = [];
    }
}

export class UserRoleQuery extends QueryObject {
    name: string;
    
    constructor(init?: Partial<UserRoleQuery>) {
        super();
        Object.assign(this, init);
    }

    clear() {
        this.name = '';
    }
}

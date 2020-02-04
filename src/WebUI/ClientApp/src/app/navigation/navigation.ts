import { FuseNavigation } from '@fuse/types';
import { RolePermissions } from 'app/shared/user-role-permission';

export const navigation: FuseNavigation[] = [
    {
        id       : 'applications',
        title    : 'Applications',
        translate: 'NAV.APPLICATIONS',
        type     : 'group',
        children : [
            {
                id       : 'sample',
                title    : 'Sample',
                translate: 'NAV.SAMPLE.TITLE',
                type     : 'item',
                icon     : 'email',
                url      : '/sample',
                badge    : {
                    title    : '25',
                    translate: 'NAV.SAMPLE.BADGE',
                    bg       : '#F44336',
                    fg       : '#FFFFFF'
                }
            },
            {
                id       : 'user',
                title    : 'User',
                // translate: 'NAV.SAMPLE.TITLE',
                type     : 'item',
                icon     : 'person',
                url      : '/pages/users',
                permissions: [RolePermissions.SuperAdmin, RolePermissions.Users.ListView]
            },
            {
                id       : 'userrole',
                title    : 'User Role',
                // translate: 'NAV.SAMPLE.TITLE',
                type     : 'item',
                icon     : 'person',
                url      : '/pages/userroles',
                permissions: [RolePermissions.SuperAdmin, RolePermissions.UserRoles.ListView]
            }
        ]
    }
];

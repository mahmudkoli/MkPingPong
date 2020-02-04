using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MkPingPong.Application.Common.Constants
{
    public static class ConstValue
    {
        public static UserRoleName UserRoleName => new UserRoleName();
        public static RolePermission RolePermission => new RolePermission();
    }

    public class UserRoleName
    {
        public string SuperAdmin => "SuperAdmin";
        public string Admin => "Admin";
    }

    public class RolePermission
    {
        public string Type => "Permission";
        public string Value => "Permissions.SuperAdmin";
    }
}

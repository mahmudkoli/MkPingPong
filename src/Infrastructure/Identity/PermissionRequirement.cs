using Microsoft.AspNetCore.Authorization;

namespace MkPingPong.Infrastructure.Identity
{
    internal class PermissionRequirement : IAuthorizationRequirement
    {
        public string Permission { get; private set; }

        public PermissionRequirement(string permission)
        {
            this.Permission = permission;
        }
    }
}
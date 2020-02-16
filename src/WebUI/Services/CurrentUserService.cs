using MkPingPong.Application.Common.Interfaces;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using System;

namespace MkPingPong.WebUI.Services
{
    public class CurrentUserService : ICurrentUserService
    {
        public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        {
            var isAuthenticated = Guid.TryParse(httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out Guid value);
            UserId = isAuthenticated ? value : (Guid?)null;
        }

        public Guid? UserId { get; }
    }
}

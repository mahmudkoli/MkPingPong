using MkPingPong.Application;
using MkPingPong.Application.Common.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using System;

namespace MkPingPong.Infrastructure.Identity
{
    public class IdentityService : IIdentityService
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public IdentityService(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        public async Task<string> GetFullNameAsync(Guid userId)
        {
            if (userId == null || userId == Guid.Empty) return string.Empty;

            var user = await _userManager.Users.FirstAsync(u => u.Id == userId);
            return user?.FullName ?? string.Empty;
        }

        public async Task<string> GetUserNameAsync(Guid userId)
        {
            if (userId == null || userId == Guid.Empty) return string.Empty;

            var user = await _userManager.Users.FirstAsync(u => u.Id == userId);
            return user?.UserName ?? string.Empty;
        }
    }
}

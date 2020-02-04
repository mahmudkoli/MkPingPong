using MkPingPong.Application;
using MkPingPong.Application.Common.Models;
using System;
using System.Threading.Tasks;

namespace MkPingPong.WebUI.IntegrationTests
{
    public class TestIdentityService : IIdentityService
    {
        public Task<string> GetUserNameAsync(Guid userId)
        {
            return Task.FromResult("jason@clean-architecture");
        }

        public Task<string> GetFullNameAsync(Guid id)
        {
            return Task.FromResult("jason@clean-architecture");
        }
    }
}

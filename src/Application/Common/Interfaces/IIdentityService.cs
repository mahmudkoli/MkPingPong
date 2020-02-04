using MkPingPong.Application.Common.Models;
using System;
using System.Threading.Tasks;

namespace MkPingPong.Application
{
    public interface IIdentityService
    {
        Task<string> GetFullNameAsync(Guid id);

        Task<string> GetUserNameAsync(Guid id);
    }
}

using MkPingPong.Application.Common.Models;
using MkPingPong.Application.Common.Models.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MkPingPong.Application.Common.Interfaces
{
    public interface IApplicationRoleService
    {
        Task<ApplicationRolesVm> GetAllAsync(ApplicationRoleQuery query);
        Task<ApplicationRoleDetailVm> GetByIdAsync(Guid id);
        Task<ApplicationRoleDetailVm> GetByNameAsync(string name);
        Task<(Result Result, Guid Id)> AddAsync(ApplicationRoleUpsert command);
        Task<Result> UpdateAsync(ApplicationRoleUpsert command);
        Task<Result> DeleteAsync(Guid id);
        Task<Result> ActiveInactiveAsync(Guid id);
        Task<IEnumerable<KeyValuePairObject>> GetAllForSelectAsync();
    }
}

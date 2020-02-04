using MkPingPong.Application.Common.Models;
using MkPingPong.Application.Common.Models.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MkPingPong.Application.Common.Interfaces
{
    public interface IApplicationUserService
    {
        Task<ApplicationUsersVm> GetAllAsync(ApplicationUserQuery query);
        Task<ApplicationUserDetailVm> GetByIdAsync(Guid id);
        Task<ApplicationUserDetailVm> GetByUserNameAsync(string name);
        Task<(Result Result, Guid Id)> AddAsync(ApplicationUserUpsert command);
        Task<Result> UpdateAsync(ApplicationUserUpsert command);
        Task<Result> DeleteAsync(Guid id);
        Task<Result> ActiveInactiveAsync(Guid id);
        Task<Result> ChangePasswordAsync(ApplicationUserPasswordUpsert command);
        Task<(Result Result, string ImageUrl)> ImageUploadAsync(Guid id, dynamic inputFile);
        Task<string> ImageSaveAsync(dynamic inputFile);
    }
}

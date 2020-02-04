using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MkPingPong.Application.Common.Interfaces;
using MkPingPong.Application.Common.Models;
using MkPingPong.Application.Common.Constants;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using MkPingPong.Application.Common.Exceptions;
using MkPingPong.Application.Common.Extensions;
using MkPingPong.Application.Common.Models.Identity;

namespace MkPingPong.Infrastructure.Identity
{
    public class ApplicationRoleService : IApplicationRoleService
    {
        private readonly RoleManager<ApplicationRole> _roleManager;
        private readonly ICurrentUserService _currentUserService;
        private readonly IDateTime _dateTime;

        public ApplicationRoleService(
            RoleManager<ApplicationRole> roleManager,
            ICurrentUserService currentUserService,
            IDateTime dateTime)
        {
            _roleManager = roleManager;
            _currentUserService = currentUserService;
            _dateTime = dateTime;
        }

        public async Task<(Result Result, Guid Id)> AddAsync(ApplicationRoleUpsert command)
        {
            var role = new ApplicationRole()
            {
                Name = command.Name,
                Status = ApplicationRoleStatus.GeneralUser,
                Created = _dateTime.Now,
                CreatedBy = _currentUserService.UserId
            };

            var roleSaveResult = await _roleManager.CreateAsync(role);

            if (!roleSaveResult.Succeeded)
            {
                throw new IdentityValidationException(roleSaveResult.Errors);
            };

            role = await _roleManager.FindByNameAsync(command.Name);

            foreach (var per in command.Permissions)
            {
                var claimSaveResult = await _roleManager.AddClaimAsync(role, new Claim(CustomClaimType.Permission, per));

                if (!claimSaveResult.Succeeded)
                {
                    throw new IdentityValidationException(claimSaveResult.Errors);
                };

            }

            return (roleSaveResult.ToApplicationResult(), role.Id);
        }

        public async Task<Result> DeleteAsync(Guid id)
        {
            var role = await _roleManager.FindByIdAsync(id.ToString());

            if (role != null)
            {
                role.IsDeleted = true;
                var result = await _roleManager.UpdateAsync(role);
                return result.ToApplicationResult();
            }

            return Result.Success();
        }

        public async Task<Result> ActiveInactiveAsync(Guid id)
        {
            var role = await _roleManager.FindByIdAsync(id.ToString());

            if (role != null)
            {
                role.IsActive = !role.IsActive;
                var result = await _roleManager.UpdateAsync(role);
                return result.ToApplicationResult();
            }

            return Result.Success();
        }

        public async Task<ApplicationRolesVm> GetAllAsync(ApplicationRoleQuery queryObj)
        {
            var result = new ApplicationRolesVm();

            var columnsMap = new Dictionary<string, Expression<Func<ApplicationRole, object>>>()
            {
                ["name"] = v => v.Name,
            };

            var query = _roleManager.Roles.AsQueryable();

            query = query.Where(x => !x.IsDeleted &&
                x.Status != ApplicationRoleStatus.SuperAdmin &&
                (string.IsNullOrWhiteSpace(queryObj.Name) || x.Name.Contains(queryObj.Name)));

            result.TotalItems = await query.CountAsync();
            query = query.ApplyOrdering(queryObj, columnsMap);
            query = query.ApplyPaging(queryObj);
            result.Items = (await query.AsNoTracking().ToListAsync())
                .Select(x =>
                new ApplicationRoleDto
                {
                    Id = x.Id,
                    Name = x.Name,
                    IsActive = x.IsActive,
                    IsDeleted = x.IsDeleted

                }).ToList();

            return result;
        }

        public async Task<ApplicationRoleDetailVm> GetByIdAsync(Guid id)
        {
            var role = await _roleManager.FindByIdAsync(id.ToString());

            if (role == null)
            {
                throw new NotFoundException(nameof(ApplicationRole), id);
            }

            var result = new ApplicationRoleDetailVm
            {
                Id = role.Id,
                Name = role.Name,
                IsActive = role.IsActive,
                IsDeleted = role.IsDeleted
            };

            var permissions = await _roleManager.GetClaimsAsync(role);
            if (permissions.Any())
            {
                result.Permissions = permissions.Select(c => c.Value).ToList();
            }

            return result;
        }

        public async Task<ApplicationRoleDetailVm> GetByNameAsync(string name)
        {
            var role = await _roleManager.FindByNameAsync(name);

            if (role == null)
            {
                throw new NotFoundException(nameof(ApplicationRole), name);
            }

            var result = new ApplicationRoleDetailVm
            {
                Id = role.Id,
                Name = role.Name,
                IsActive = role.IsActive,
                IsDeleted = role.IsDeleted
            };

            var permissions = await _roleManager.GetClaimsAsync(role);
            if (permissions.Any())
            {
                result.Permissions = permissions.Select(c => c.Value).ToList();
            }

            return result;
        }

        public async Task<Result> UpdateAsync(ApplicationRoleUpsert command)
        {
            var role = await _roleManager.FindByIdAsync(command.Id.ToString());

            if (role == null)
            {
                throw new NotFoundException(nameof(ApplicationRole), command.Id);
            }

            role.Name = command.Name;
            role.LastModified = _dateTime.Now;
            role.LastModifiedBy = _currentUserService.UserId;

            var roleSaveResult = await this._roleManager.UpdateAsync(role);

            if (!roleSaveResult.Succeeded)
            {
                throw new IdentityValidationException(roleSaveResult.Errors);
            };

            // Remove Previous Permission
            var removedPermissions = await _roleManager.GetClaimsAsync(role);
            foreach (var per in removedPermissions)
            {
                var claimRemoveResult = await _roleManager.RemoveClaimAsync(role, per);

                if (!claimRemoveResult.Succeeded)
                {
                    throw new IdentityValidationException(claimRemoveResult.Errors);
                };

            }

            // Add New Permission
            foreach (var per in command.Permissions)
            {
                var claimSaveResult = await _roleManager.AddClaimAsync(role, new Claim(CustomClaimType.Permission, per));

                if (!claimSaveResult.Succeeded)
                {
                    throw new IdentityValidationException(claimSaveResult.Errors);
                };

            }

            return roleSaveResult.ToApplicationResult();
        }

        public async Task<IEnumerable<KeyValuePairObject>> GetAllForSelectAsync()
        {
            return (await _roleManager.Roles.Where(x => x.IsActive && !x.IsDeleted).ToListAsync())
                .Select(x => new KeyValuePairObject { Id = x.Id, Name = x.Name });
        }
    }
}

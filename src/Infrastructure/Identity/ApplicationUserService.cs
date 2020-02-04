using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MkPingPong.Application.Common.Interfaces;
using MkPingPong.Application.Common.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using MkPingPong.Application.Common.Exceptions;
using MkPingPong.Application.Common.Extensions;
using MkPingPong.Application.Common.Models.Identity;
using MkPingPong.Application.Common.Constants;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System.IO;

namespace MkPingPong.Infrastructure.Identity
{
    public class ApplicationUserService : IApplicationUserService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<ApplicationRole> _roleManager;
        private readonly ICurrentUserService _currentUserService;
        private readonly IDateTime _dateTime;
        private readonly IHostingEnvironment _host;
        private readonly AppSettings _appSettings;
        private readonly PhotoSettings _photoSettings;
        private readonly IPhotoStorage _photoStorage;

        public ApplicationUserService(
            UserManager<ApplicationUser> userManager,
            RoleManager<ApplicationRole> roleManager,
            ICurrentUserService currentUserService,
            IDateTime dateTime,
            IHostingEnvironment host,
            IOptionsSnapshot<AppSettings> appOptions,
            IOptionsSnapshot<PhotoSettings> photoOptions,
            IPhotoStorage photoStorage)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _currentUserService = currentUserService;
            _dateTime = dateTime;
            _host = host;
            _appSettings = appOptions.Value;
            _photoSettings = photoOptions.Value;
            _photoStorage = photoStorage;
        }

        public async Task<(Result Result, Guid Id)> AddAsync(ApplicationUserUpsert command)
        {
            var user = new ApplicationUser
            {
                UserName = command.UserName,
                Email = command.Email,
                FullName = command.FullName,
                Address = command.Address,
                Gender = command.Gender,
                //ImageUrl = command.ImageUrl??string.Empty,
                PhoneNumber = command.PhoneNumber,
                Status = ApplicationUserStatus.GeneralUser,
                Created = _dateTime.Now,
                CreatedBy = _currentUserService.UserId
            };

            var userSaveResult = await _userManager.CreateAsync(user, _appSettings.UserNewPassword);

            if (!userSaveResult.Succeeded)
            {
                throw new IdentityValidationException(userSaveResult.Errors);
            };

            // Add New User Role
            user = await _userManager.FindByNameAsync(user.UserName);
            var role = await _roleManager.FindByIdAsync(command.UserRoleId.ToString());

            if (role == null)
            {
                throw new NotFoundException(nameof(ApplicationRole), command.UserRoleId);
            }

            var roleSaveResult = await _userManager.AddToRoleAsync(user, role.Name);

            if (!roleSaveResult.Succeeded)
            {
                throw new IdentityValidationException(roleSaveResult.Errors);
            };

            return (userSaveResult.ToApplicationResult(), user.Id);
        }

        public async Task<Result> DeleteAsync(Guid id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());

            if (user != null)
            {
                user.IsDeleted = true;
                var result = await _userManager.UpdateAsync(user);

                if (!result.Succeeded)
                {
                    throw new IdentityValidationException(result.Errors);
                };

                return result.ToApplicationResult();
            }

            return Result.Success();
        }

        public async Task<Result> ActiveInactiveAsync(Guid id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());

            if (user != null)
            {
                user.IsActive = !user.IsActive;
                var result = await _userManager.UpdateAsync(user);

                if (!result.Succeeded)
                {
                    throw new IdentityValidationException(result.Errors);
                };

                return result.ToApplicationResult();
            }

            return Result.Success();
        }

        public async Task<ApplicationUsersVm> GetAllAsync(ApplicationUserQuery queryObj)
        {
            var result = new ApplicationUsersVm();

            var columnsMap = new Dictionary<string, Expression<Func<ApplicationUser, object>>>()
            {
                ["fullName"] = v => v.FullName,
                ["userName"] = v => v.UserName,
                ["email"] = v => v.Email
            };

            var query = _userManager.Users.Include(u => u.UserRoles).ThenInclude(ur => ur.Role).AsQueryable();

            query = query.Where(x => !x.IsDeleted &&
                x.Status != ApplicationUserStatus.SuperAdmin &&
                (string.IsNullOrWhiteSpace(queryObj.FullName) || x.FullName.Contains(queryObj.FullName)) &&
                (string.IsNullOrWhiteSpace(queryObj.UserName) || x.UserName.Contains(queryObj.UserName)) &&
                (string.IsNullOrWhiteSpace(queryObj.Email) || x.Email.Contains(queryObj.Email)));

            result.TotalItems = await query.CountAsync();
            query = query.ApplyOrdering(queryObj, columnsMap);
            query = query.ApplyPaging(queryObj);
            result.Items = (await query.AsNoTracking().ToListAsync())
                .Select(x => 
                new ApplicationUserDto 
                { 
                    Id = x.Id,
                    FullName = x.FullName,
                    UserName = x.UserName,
                    Email = x.Email,
                    PhoneNumber = x.PhoneNumber,
                    Address = x.Address,
                    ImageUrl = x.ImageUrl,
                    Gender = x.Gender,
                    UserRole = new KeyValuePairObject
                    {
                        Id = x.UserRoles?.FirstOrDefault()?.Role?.Id ?? Guid.NewGuid(),
                        Name = x.UserRoles?.FirstOrDefault()?.Role?.Name
                    },
                    IsActive = x.IsActive,
                    IsDeleted = x.IsDeleted

                }).ToList();

            return result;
        }

        public async Task<ApplicationUserDetailVm> GetByIdAsync(Guid id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());

            if (user == null)
            {
                throw new NotFoundException(nameof(ApplicationUser), id);
            }

            var userRoleName = (await _userManager.GetRolesAsync(user))?.FirstOrDefault();

            if (userRoleName == null)
            {
                throw new NotFoundException(nameof(ApplicationUserRole), userRoleName);
            }

            var userRole = await _roleManager.FindByNameAsync(userRoleName);

            if (userRole == null)
            {
                throw new NotFoundException(nameof(ApplicationRole), userRole);
            }

            var result = new ApplicationUserDetailVm
            {
                Id = user.Id,
                FullName = user.FullName,
                UserName = user.UserName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Address = user.Address,
                ImageUrl = user.ImageUrl,
                Gender = user.Gender,
                UserRole = new KeyValuePairObject
                {
                    Id = userRole.Id,
                    Name = userRole.Name
                },
                IsActive = user.IsActive,
                IsDeleted = user.IsDeleted
            };
            return result;
        }

        public async Task<ApplicationUserDetailVm> GetByUserNameAsync(string userName)
        {
            var user = await _userManager.FindByNameAsync(userName);

            if (user == null)
            {
                throw new NotFoundException(nameof(ApplicationUser), userName);
            }

            var userRoleName = (await _userManager.GetRolesAsync(user))?.FirstOrDefault();

            if (userRoleName == null)
            {
                throw new NotFoundException(nameof(ApplicationUserRole), userRoleName);
            }

            var userRole = await _roleManager.FindByNameAsync(userRoleName);

            if (userRole == null)
            {
                throw new NotFoundException(nameof(ApplicationRole), userRole);
            }

            var result = new ApplicationUserDetailVm
            {
                Id = user.Id,
                FullName = user.FullName,
                UserName = user.UserName,
                Email = user.Email,
                Address = user.Address,
                ImageUrl = user.ImageUrl,
                Gender = user.Gender,
                UserRole = new KeyValuePairObject
                {
                    Id = userRole.Id,
                    Name = userRole.Name
                },
                IsActive = user.IsActive,
                IsDeleted = user.IsDeleted
            };
            return result;
        }

        public async Task<Result> UpdateAsync(ApplicationUserUpsert command)
        {
            var user = await this._userManager.FindByIdAsync(command.Id.ToString());

            if (user == null)
            {
                throw new NotFoundException(nameof(ApplicationUser), command.Id);
            }

            user.FullName = command.FullName;
            user.UserName = command.UserName;
            user.Email = command.Email;
            user.Address = command.Address;
            user.Gender = command.Gender;
            //user.ImageUrl = command.ImageUrl??user.ImageUrl;
            user.PhoneNumber = command.PhoneNumber;
            user.LastModified = _dateTime.Now;
            user.LastModifiedBy = _currentUserService.UserId;

            var userSaveResult = await _userManager.UpdateAsync(user);

            if (!userSaveResult.Succeeded)
            {
                throw new IdentityValidationException(userSaveResult.Errors);
            };

            // Remove Previous User Role
            var previousUserRoles = await _userManager.GetRolesAsync(user);
            if (previousUserRoles.Any())
            {
                var roleRemoveResult = await _userManager.RemoveFromRolesAsync(user, previousUserRoles);

                if (!roleRemoveResult.Succeeded)
                {
                    throw new IdentityValidationException(roleRemoveResult.Errors);
                };

            }

            // Add New User Role
            var role = await _roleManager.FindByIdAsync(command.UserRoleId.ToString());

            if (user == null)
            {
                throw new NotFoundException(nameof(ApplicationRole), command.UserRoleId);
            }

            var roleSaveResult = await _userManager.AddToRoleAsync(user, role.Name);

            if (!roleSaveResult.Succeeded)
            {
                throw new IdentityValidationException(roleSaveResult.Errors);
            };


            return userSaveResult.ToApplicationResult();
        }

        public async Task<Result> ChangePasswordAsync(ApplicationUserPasswordUpsert command)
        {
            var user = await _userManager.FindByIdAsync(command.Id.ToString());

            if (user == null)
            {
                throw new NotFoundException(nameof(ApplicationUser), command.Id);
            }

            var hashPassword = _userManager.PasswordHasher.HashPassword(user, command.NewPassword);
            user.LastPassword = user.PasswordHash;
            user.PasswordHash = hashPassword;
            user.PasswordChangedCount += 1;
            user.LastPassChangeDate = _dateTime.Now;

            var userSaveResult = await _userManager.UpdateAsync(user);

            if (!userSaveResult.Succeeded)
            {
                throw new IdentityValidationException(userSaveResult.Errors);
            };

            return userSaveResult.ToApplicationResult();
        }

        public async Task<(Result Result, string ImageUrl)> ImageUploadAsync(Guid id, dynamic inputFile)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());

            if (user == null)
            {
                throw new NotFoundException(nameof(ApplicationUser), id);
            }

            var imageUrl = (string)(await ImageSaveAsync(inputFile));
            user.ImageUrl = imageUrl;

            var userSaveResult = await _userManager.UpdateAsync(user);

            if (!userSaveResult.Succeeded)
            {
                throw new IdentityValidationException(userSaveResult.Errors);
            };

            return (userSaveResult.ToApplicationResult(), imageUrl);
        }

        public async Task<string> ImageSaveAsync(dynamic inputFile) 
        {
            IFormFile formFile = inputFile;
            if (formFile == null) throw new Exception("Null file");
            if (formFile.Length == 0) throw new Exception("Empty file");
            if (formFile.Length > _photoSettings.MaxBytes) throw new Exception("Max file size exceeded");
            if (!_photoSettings.IsSupported(formFile.FileName)) throw new Exception("Invalid file type.");
            var uploadsFolderPath = Path.Combine(_host.WebRootPath, "uploads");
            var imageUrl = await _photoStorage.StorePhoto(uploadsFolderPath, formFile);
            return imageUrl;
        }
    }
}

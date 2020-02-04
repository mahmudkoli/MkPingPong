using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MkPingPong.Application.Common.Interfaces;
using MkPingPong.Application.Common.Models;
using MkPingPong.Application.Common.Models.Identity;
using MkPingPong.Application.Common.Constants;

namespace MkPingPong.WebUI.Controllers
{
    [Authorize]
    public class UsersController : ApiController
    {
        private IApplicationUserService _applicationUserService;

        public UsersController(IApplicationUserService applicationUserService)
        {
            _applicationUserService = applicationUserService;
        }

        [HttpGet]
        [Authorize(Permissions.Users.ListView)]
        public async Task<ActionResult<ApplicationUsersVm>> Get([FromQuery] ApplicationUserQuery query)
        {
            return await _applicationUserService.GetAllAsync(query);
        }

        [HttpGet("{id}")]
        [Authorize(Permissions.Users.DetailsView)]
        public async Task<ActionResult<ApplicationUserDetailVm>> Get(Guid id)
        {
            return await _applicationUserService.GetByIdAsync(id);
        }

        [HttpPost]
        [Authorize(Permissions.Users.Create)]
        public async Task<ActionResult<Guid>> Create([FromBody] ApplicationUserUpsert command)
        {
            var result = await _applicationUserService.AddAsync(command);
            return result.Id;
        }

        [HttpPut("{id}")]
        [Authorize(Permissions.Users.Edit)]
        public async Task<ActionResult> Update(Guid id, [FromBody] ApplicationUserUpsert command)
        {
            if (id != command.Id) return BadRequest();

            await _applicationUserService.UpdateAsync(command);
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Permissions.Users.Delete)]
        public async Task<ActionResult> Delete(Guid id)
        {
            await _applicationUserService.DeleteAsync(id);
            return NoContent();
        }

        [HttpPost("{id}/activeInactive")]
        public async Task<ActionResult> ActiveInactive(Guid id)
        {
            await _applicationUserService.ActiveInactiveAsync(id);
            return NoContent();
        }

        [HttpPost("{id}/changePassword")]
        public async Task<ActionResult> ChangePassword(Guid id, [FromBody] ApplicationUserPasswordUpsert command)
        {
            if (id != command.Id) return BadRequest();

            await _applicationUserService.ChangePasswordAsync(command);
            return NoContent();
        }

        [HttpPost("{id}/imageUpload")]
        public async Task<ActionResult<dynamic>> ImageUpload(Guid id, [FromForm] IFormFile inputFile)
        {
            var result = await _applicationUserService.ImageUploadAsync(id, inputFile);
            return new { result.ImageUrl };
        }
    }
}
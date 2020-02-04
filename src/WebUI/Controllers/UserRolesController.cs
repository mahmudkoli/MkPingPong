using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MkPingPong.Application.Common.Interfaces;
using MkPingPong.Application.Common.Models;
using MkPingPong.Application.Common.Models.Identity;
using MkPingPong.Application.Common.Constants;

namespace MkPingPong.WebUI.Controllers
{
    [Authorize]
    public class UserRolesController : ApiController
    {
        private IApplicationRoleService _applicationRoleService;

        public UserRolesController(IApplicationRoleService applicationRoleService)
        {
            _applicationRoleService = applicationRoleService;
        }

        [HttpGet]
        [Authorize(Permissions.UserRoles.ListView)]
        public async Task<ActionResult<ApplicationRolesVm>> Get([FromQuery] ApplicationRoleQuery query)
        {
            return await _applicationRoleService.GetAllAsync(query);
        }

        [HttpGet("{id}")]
        [Authorize(Permissions.UserRoles.DetailsView)]
        public async Task<ActionResult<ApplicationRoleDetailVm>> Get(Guid id)
        {
            return await _applicationRoleService.GetByIdAsync(id);
        }

        [HttpPost]
        [Authorize(Permissions.UserRoles.Create)]
        public async Task<ActionResult<Guid>> Create([FromBody] ApplicationRoleUpsert command)
        {
            var result = await _applicationRoleService.AddAsync(command);
            return result.Id;
        }

        [HttpPut("{id}")]
        [Authorize(Permissions.UserRoles.Edit)]
        public async Task<ActionResult> Update(Guid id, [FromBody] ApplicationRoleUpsert command)
        {
            if (id != command.Id) return BadRequest();

            await _applicationRoleService.UpdateAsync(command);
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Permissions.UserRoles.Delete)]
        public async Task<ActionResult> Delete(Guid id)
        {
            await _applicationRoleService.DeleteAsync(id);
            return NoContent();
        }

        [HttpPost("{id}/activeInactive")]
        public async Task<IActionResult> ActiveInactive(Guid id)
        {
            await _applicationRoleService.ActiveInactiveAsync(id);
            return NoContent();
        }
    }
}
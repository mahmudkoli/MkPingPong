using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MkPingPong.Application.Common.Interfaces;
using MkPingPong.Application.Common.Models;

namespace MkPingPong.WebUI.Controllers
{
    public class SelectController : ApiController
    {
        private IApplicationRoleService _applicationRoleService;

        public SelectController(IApplicationRoleService applicationRoleService)
        {
            _applicationRoleService = applicationRoleService;
        }

        [HttpGet("userroles")]
        public async Task<IEnumerable<KeyValuePairObject>> GetUserRoles()
        {
            return await _applicationRoleService.GetAllForSelectAsync();
        }

    }

}
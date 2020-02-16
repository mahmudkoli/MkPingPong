using MkPingPong.Application.Common.Interfaces;
using System;

namespace MkPingPong.WebUI.IntegrationTests
{
    public class TestCurrentUserService : ICurrentUserService
    {
        public Guid? UserId => Guid.Empty;
    }
}

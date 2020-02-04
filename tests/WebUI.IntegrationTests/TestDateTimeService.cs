using MkPingPong.Application.Common.Interfaces;
using System;

namespace MkPingPong.WebUI.IntegrationTests
{
    public class TestDateTimeService : IDateTime
    {
        public DateTime Now => DateTime.Now;
    }
}

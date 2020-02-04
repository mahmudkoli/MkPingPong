using MkPingPong.Application.Common.Interfaces;
using System;

namespace MkPingPong.Infrastructure.Services
{
    public class DateTimeService : IDateTime
    {
        public DateTime Now => DateTime.Now;
    }
}

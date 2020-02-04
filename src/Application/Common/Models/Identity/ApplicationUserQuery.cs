using MkPingPong.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MkPingPong.Application.Common.Models.Identity
{
    public class ApplicationUserQuery : QueryObject
    {
        public string UserName { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
    }
}

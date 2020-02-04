using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MkPingPong.Application.Common.Models.Identity
{
    public class ApplicationUserPasswordUpsert
    {
        public Guid Id { get; set; }
        public string NewPassword { get; set; }
    }
}

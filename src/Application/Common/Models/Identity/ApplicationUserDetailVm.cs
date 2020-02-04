using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MkPingPong.Application.Common.Models.Identity
{
    public class ApplicationUserDetailVm
    {
        public Guid Id { get; set; }
        public string FullName { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string Address { get; set; }
        public string Gender { get; set; }
        public string ImageUrl { get; set; }
        public KeyValuePairObject UserRole { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
    }
}

﻿using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MkPingPong.Infrastructure.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MkPingPong.Infrastructure.Persistence.Configurations
{
    public class ApplicationUserRoleConfiguraion : IEntityTypeConfiguration<ApplicationUserRole>
    {
        public void Configure(EntityTypeBuilder<ApplicationUserRole> builder)
        {
            //builder.HasKey(ur => new { ur.UserId, ur.RoleId });

            //builder.HasOne(ur => ur.Role)
            //    .WithMany(r => r.UserRoles)
            //    .HasForeignKey(ur => ur.RoleId)
            //    .IsRequired();

            //builder.HasOne(ur => ur.User)
            //    .WithMany(r => r.UserRoles)
            //    .HasForeignKey(ur => ur.UserId)
            //    .IsRequired();
        }
    }
}

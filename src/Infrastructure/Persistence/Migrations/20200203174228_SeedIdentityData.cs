using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore.Migrations;
using MkPingPong.Application.Common.Constants;
using MkPingPong.Infrastructure.Identity;
using System;

namespace MkPingPong.Infrastructure.Persistence.Migrations
{
    public partial class SeedIdentityData : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            var hasher = new PasswordHasher<ApplicationUser>();
            var hashPassword = hasher.HashPassword(null, "12345");

            // Seed Role 
            migrationBuilder.Sql("INSERT INTO AspNetRoles (Id,Name,NormalizedName,Status,IsActive,IsDeleted,Created) VALUES ('" + Guid.NewGuid() + "','" +
                ConstValue.UserRoleName.SuperAdmin + "','" + ConstValue.UserRoleName.SuperAdmin.ToUpper() + "','" + (int)ApplicationRoleStatus.SuperAdmin + "','true','false','" + DateTime.Now + "')");
            migrationBuilder.Sql("INSERT INTO AspNetRoles (Id,Name,NormalizedName,Status,IsActive,IsDeleted,Created) VALUES ('" + Guid.NewGuid() + "','" +
                ConstValue.UserRoleName.Admin + "','" + ConstValue.UserRoleName.Admin.ToUpper() + "','" + (int)ApplicationRoleStatus.GeneralUser + "','true','false','" + DateTime.Now + "')");

            // Seed User
            migrationBuilder.Sql("INSERT INTO AspNetUsers (Id,UserName,NormalizedUserName,Email,NormalizedEmail,EmailConfirmed,PasswordHash,PhoneNumberConfirmed,TwoFactorEnabled," +
                "LockoutEnabled,AccessFailedCount,FullName,PasswordChangedCount,Status,IsActive,IsDeleted,Created,SecurityStamp)" +
                " VALUES ('" + Guid.NewGuid() + "','admin','ADMIN','admin@gmail.com','ADMIN@GMAIL.COM','false','" + hashPassword + "','false','false','false','0','Administrator','1','" +
                (int)ApplicationUserStatus.SuperAdmin + "','true','false','" + DateTime.Now + "','" + Guid.NewGuid() + "')");
            migrationBuilder.Sql("INSERT INTO AspNetUsers (Id,UserName,NormalizedUserName,Email,NormalizedEmail,EmailConfirmed,PasswordHash,PhoneNumberConfirmed,TwoFactorEnabled," +
                "LockoutEnabled,AccessFailedCount,FullName,PasswordChangedCount,Status,IsActive,IsDeleted,Created,SecurityStamp)" +
                " VALUES ('" + Guid.NewGuid() + "','dev','DEV','dev@gmail.com','DEV@GMAIL.COM','false','" + hashPassword + "','false','false','false','0','Development','1','" +
                (int)ApplicationUserStatus.SuperAdmin + "','true','false','" + DateTime.Now + "','" + Guid.NewGuid() + "')");

            // Seed UserRole
            migrationBuilder.Sql("INSERT INTO AspNetUserRoles (UserId,RoleId) VALUES ((SELECT Id FROM AspNetUsers WHERE UserName = 'admin')," +
                "(SELECT Id FROM AspNetRoles WHERE Name = '" + ConstValue.UserRoleName.SuperAdmin + "'))");
            migrationBuilder.Sql("INSERT INTO AspNetUserRoles (UserId,RoleId) VALUES ((SELECT Id FROM AspNetUsers WHERE UserName = 'dev')," +
                "(SELECT Id FROM AspNetRoles WHERE Name = '" + ConstValue.UserRoleName.SuperAdmin + "'))");

            // Seed Role Claim
            migrationBuilder.Sql("INSERT INTO AspNetRoleClaims (RoleId,ClaimType,ClaimValue) VALUES (" +
                "(SELECT Id FROM AspNetRoles WHERE Name = '" + ConstValue.UserRoleName.SuperAdmin + "')," +
                "'" + ConstValue.RolePermission.Type + "','" + ConstValue.RolePermission.Value + "')");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DELETE FROM AspNetRoleClaims WHERE ClaimType = '" + ConstValue.RolePermission.Type + "'" +
                " AND ClaimValue = '" + ConstValue.RolePermission.Value + "'");
            migrationBuilder.Sql("DELETE FROM AspNetUsers WHERE UserName IN ('admin','dev')");
            migrationBuilder.Sql("DELETE FROM AspNetRoles WHERE Name IN ('" +
                ConstValue.UserRoleName.SuperAdmin + "','" +
                ConstValue.UserRoleName.Admin + "')");
        }
    }
}

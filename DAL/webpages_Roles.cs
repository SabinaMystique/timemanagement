//------------------------------------------------------------------------------
// <auto-generated>
//    This code was generated from a template.
//
//    Manual changes to this file may cause unexpected behavior in your application.
//    Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace TimeManagement.DAL
{
    using System;
    using System.Collections.Generic;
    
    public partial class webpages_Roles
    {
        public webpages_Roles()
        {
            this.User = new HashSet<User>();
        }
    
        public int RoleId { get; set; }
        public string RoleName { get; set; }
    
        public virtual ICollection<User> User { get; set; }
    }
}

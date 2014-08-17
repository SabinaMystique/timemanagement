using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TimeManagement.DAL;

namespace TimeManagement.Interfaces
{
    interface IUserRepository
    {
        IEnumerable<User> GetAll();
        User Get(int userID);
        User GetUserForAuth(string email, string passwd);
        User Add(User item);
        void Remove(int userID);
        void Update(User item);
    }
}

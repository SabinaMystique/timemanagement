using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using TimeManagement.DAL;

namespace TimeManagement.Repositories
{
    public class UserRepository : Interfaces.IUserRepository
    {
        TimeManagementEntities context = new TimeManagementEntities();

        public IEnumerable<User> GetAll()
        {
            return context.User.Where(x => x.IsDeleted == false).ToList();
        }
        public User Get(int userID)
        {
            return context.User.Where(x => x.ID == userID).SingleOrDefault();
        }
        public User GetUserForAuth(string email, string passwd)
        {
            return context.User.Where(x => x.Email == email && x.Password == passwd).SingleOrDefault();
        }

        public User Add(User user)
        {
            user.CreatedDate = DateTime.Now;
            context.User.Add(user);
            context.SaveChanges();
            return user;
        }
        public void Remove(int userid)
        {
            User usr = context.User.Where(x => x.ID == userid).SingleOrDefault();
            usr.IsDeleted = true;
            context.SaveChanges();
        }
        public void Update(User user)
        {
            var currentUser = context.User.Find(user.ID);
            context.Entry(currentUser).CurrentValues.SetValues(user);
            context.SaveChanges();
        }
    }
}
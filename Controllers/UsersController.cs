namespace TimeManagement.Controllers
{
    using System;
    using System.Net;
    using System.Net.Http;
    using System.Threading.Tasks;
    using System.Web;
    using System.Web.Http;
    using System.Web.Security;

    using WebMatrix.WebData;

    using Infrastructure;
    using TimeManagement.Interfaces;
    using System.Collections.Generic;
    using TimeManagement.Repositories;
    using TimeManagement.DAL;

  public class UsersController : ApiController
    {
        static readonly IUserRepository repository = new UserRepository();
       
      
        public IEnumerable<User> GetAllUsers()
        {
            return repository.GetAll();
        }
        public User GetUserForAuth(string email, string passwd)
        {
            return repository.GetUserForAuth(email, passwd);
        }

        public void Post(User usr)
        {
            repository.Add(usr);
        }
        public void Put(User usr)
        {
            repository.Update(usr);
        }
    }
}
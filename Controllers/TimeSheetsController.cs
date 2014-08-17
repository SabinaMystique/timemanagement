using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Principal;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Routing;
using TimeManagement.DAL;
using TimeManagement.Interfaces;
using TimeManagement.Repositories;

namespace TimeManagement.Controllers
{
    public class TimeSheetsController : ApiController
    {
        public static String loggedinUser;
        static readonly ITimeManagementRepository repository = new TimeManagementRepository();

        [BasicHttpAuthorizeAttribute(RequireAuthentication = true)]
        public List<TimeSheet> GetAllTimesheet()
        {
            List<TimeSheet> lista = repository.GetAll();
            return lista;
        }

        public void Post(TimeSheet timesheet)
        {
            TimeManagementEntities context = new TimeManagementEntities();
          //  TimeSheet temp = new TimeSheet();
            timesheet.Notes = HttpUtility.HtmlEncode(timesheet.Notes);
            //timesheet.DateOfSheet = timesheet.DateOfSheet;
            //timesheet.TotalTime = timesheet.TotalTime;
            //timesheet.CreatedDate = timesheet.CreatedDate;
            repository.Add(timesheet);
        }

        public void Delete(int ID)
        {
            repository.Remove(ID);
        }
        public HttpResponseMessage Put(TimeSheet exp)
        {
            TimeManagementEntities context = new TimeManagementEntities();
            TimeSheet temp = context.TimeSheet.Where(x => x.ID == exp.ID).SingleOrDefault();
            //temp.Notes = HttpUtility.HtmlDecode(exp.Notes);
            //temp.DateOfSheet = exp.DateOfSheet;
            //temp.TotalTime= exp.TotalTime;
            //temp.CreatedDate = exp.CreatedDate;
            if (temp.IsDeleted == true)
            {
                var resp = new HttpResponseMessage(HttpStatusCode.NotFound);
                return resp;
            }
            else
            {
                temp.Notes = HttpUtility.HtmlEncode(exp.Notes);
                temp.TotalTime = exp.TotalTime;
                temp.DateOfSheet = exp.DateOfSheet;
                temp.CreatedDate = exp.CreatedDate;
                repository.Update(temp);
                var resp = new HttpResponseMessage(HttpStatusCode.OK);
                return resp;
            }
        }
    }
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public class NoDirectAccessAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            if (filterContext.HttpContext.Request.UrlReferrer == null ||
                        filterContext.HttpContext.Request.Url.Host != filterContext.HttpContext.Request.UrlReferrer.Host)
            {
                filterContext.Result = new RedirectToRouteResult(new RouteValueDictionary(new { controller = "Home", action = "Index", area = "" }));
            }
        }
    }
    public class BasicHttpAuthorizeAttribute : System.Web.Http.AuthorizeAttribute
    {
        bool requireSsl = Convert.ToBoolean(ConfigurationManager.AppSettings["RequireSsl"]);

        public bool RequireSsl
        {
            get { return requireSsl; }
            set { requireSsl = value; }
        }


        bool requireAuthentication = true;

        public bool RequireAuthentication
        {
            get { return requireAuthentication; }
            set { requireAuthentication = value; }
        }


        /// <summary>
        /// For logging with Log4net.
        /// </summary>

        public override void OnAuthorization(System.Web.Http.Controllers.HttpActionContext actionContext)
        {
            //actionContext.Request

            if (Authenticate(actionContext) || !RequireAuthentication)
            {
                return;
            }
            else
            {
                HandleUnauthorizedRequest(actionContext);
            }
        }

        protected override void HandleUnauthorizedRequest(System.Web.Http.Controllers.HttpActionContext actionContext)
        {
            var challengeMessage = new System.Net.Http.HttpResponseMessage(System.Net.HttpStatusCode.Unauthorized);
            challengeMessage.Headers.Add("WWW-Authenticate", "Basic");
            throw new HttpResponseException(challengeMessage);
            //throw new HttpResponseException();
        }


        private bool Authenticate(System.Web.Http.Controllers.HttpActionContext actionContext) //HttpRequestMessage input)
        {
            if (RequireSsl && !HttpContext.Current.Request.IsSecureConnection && !HttpContext.Current.Request.IsLocal)
            {
                return false;
            }

            if (!HttpContext.Current.Request.Headers.AllKeys.Contains("Authorization")) return false;

            string authHeader = HttpContext.Current.Request.Headers["Authorization"];
            String cook = HttpContext.Current.Request.Headers["Set-Cookie"];

            IPrincipal principal;
            if (TryGetPrincipal(authHeader, out principal))
            {
                HttpContext.Current.User = principal;
                return true;
            }
            return false;
        }


        private bool TryGetPrincipal(string authHeader, out IPrincipal principal)
        {
            var creds = ParseAuthHeader(authHeader);
            if (creds != null)
            {
                if (TryGetPrincipal(creds[0], creds[1], out principal)) return true;
            }

            principal = null;
            return false;
        }


        private string[] ParseAuthHeader(string authHeader)
        {
            // Check this is a Basic Auth header 
            if (authHeader == null || authHeader.Length == 0 || !authHeader.StartsWith("Basic")) return null;

            // Pull out the Credentials with are seperated by ':' and Base64 encoded 
            string base64Credentials = authHeader.Substring(6);
            string[] credentials = new string[2];

            credentials[0] = base64Credentials;
            credentials[1] = String.Empty;

            LoggedInUser.loggedInUserEmail = credentials[0];

            if (string.IsNullOrEmpty(credentials[0])) return null;

            // Okay this is the credentials 
            return credentials;
        }


        private bool TryGetPrincipal(string username, string password, out IPrincipal principal)
        {
            // this is the method that does the authentication 

            //users often add a copy/paste space at the end of the username
            username = username.Trim();
            password = password.Trim();

            //TODO
            //Replace this with your own Authentication Code

            TimeManagementEntities context = new TimeManagementEntities();
            User user = context.User.Where(x => x.Email == username).SingleOrDefault();

            //AccountManagement.ApiLogin(username, password);

            if (user != null)
            {
                // once the user is verified, assign it to an IPrincipal with the identity name and applicable roles
                String[] roles = { "Administrator" };
                principal = new GenericPrincipal(new GenericIdentity(username), roles);

                return true;
            }
            else
            {
                if (!String.IsNullOrWhiteSpace(username))
                {

                }
                principal = null;
                return false;
            }
        }
    }
   
}

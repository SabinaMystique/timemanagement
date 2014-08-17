using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Microsoft.Reporting.WebForms;
using TimeManagement.DAL;

namespace TimeManagement.Controllers
{
    public class ReportController : Controller
    {
        //
        // GET: /Report/

        //[NoDirectAccess]
        public static List<TimeSheet> listForReport=new List<TimeSheet>();
        public ActionResult Index(string fromDate,string toDate, string searchString)
        {
            string g = fromDate + " " + toDate + " " + searchString;
            String fromDateForSQL = String.Empty;
            String toDateForSQL = String.Empty;
            if (fromDate != "" && toDate != "")
            {
                String fromDD = fromDate.Substring(0, 2);
                String fromMM = fromDate.Substring(3, 2);
                String fromYY = fromDate.Substring(6, 4);
                fromDateForSQL = fromYY + "/" + fromMM + "/" + fromDD;

                String toDD = toDate.Substring(0, 2);
                String toMM = toDate.Substring(3, 2);
                String toYY = toDate.Substring(6, 4);
                toDateForSQL = toYY + "/" + toMM + "/" + toDD;

                using (TimeManagementEntities context = new TimeManagementEntities())
                {

                    DateTime dtFrom = Convert.ToDateTime(fromDateForSQL);
                    DateTime dtTo = Convert.ToDateTime(toDateForSQL);
                    int userid = context.User.Where(x => x.Email == LoggedInUser.loggedInUserEmail && x.IsDeleted == false).Select(u => u.ID).SingleOrDefault();

                    var v = context.TimeSheet.Where(x => (x.DateOfSheet >= dtFrom.Date && x.DateOfSheet <= dtTo.Date) && x.UserID == userid && x.IsDeleted == false && x.Notes.Contains(searchString)).ToList();
                    listForReport = (List<TimeSheet>)v;
                    return View(v);
                }
            }
            else
            {
                using (TimeManagementEntities context = new TimeManagementEntities())
                {

              
                    int userid = context.User.Where(x => x.Email == LoggedInUser.loggedInUserEmail && x.IsDeleted == false).Select(u => u.ID).SingleOrDefault();

                    var v = context.TimeSheet.Where(x => x.UserID == userid && x.IsDeleted == false && x.Notes.Contains(searchString)).ToList();
                    listForReport = (List<TimeSheet>)v;
                    return View(v);
                }
            }

            return null;

        }
        [NoDirectAccess]
        public ActionResult Report(string id, string fromDate, string toDate, string searchString)
        {
            LocalReport lr = new LocalReport();
            string path = Path.Combine(Server.MapPath("~/"), "Report2.rdlc");
            if (System.IO.File.Exists(path))
            {
                lr.ReportPath = path;
            }
            else
            {
                return View("Index");
            }

            using (TimeManagementEntities context = new TimeManagementEntities())
            {


                int userid = context.User.Where(x => x.Email == LoggedInUser.loggedInUserEmail && x.IsDeleted == false).Select(u => u.ID).SingleOrDefault();

                List<TimeSheet> cn = context.TimeSheet.Where(x => x.UserID == userid && x.IsDeleted == false).ToList();
                ReportDataSource rd = new ReportDataSource("TimeManagementDataSet", listForReport);
                lr.DataSources.Add(rd);
            
            }

         

         
            string reportType = id;
            string mimeType;
            string encoding;
            string fileNameExtension;


            string deviceInfo =

            "<DeviceInfo>" +
            "  <OutputFormat>" + id + "</OutputFormat>" +
            "  <PageWidth>8.5in</PageWidth>" +
            "  <PageHeight>11in</PageHeight>" +
            "  <MarginTop>0.5in</MarginTop>" +
            "  <MarginLeft>1in</MarginLeft>" +
            "  <MarginRight>1in</MarginRight>" +
            "  <MarginBottom>0.5in</MarginBottom>" +
            "</DeviceInfo>";

            Warning[] warnings;
            string[] streams;
            byte[] renderedBytes;

            renderedBytes = lr.Render(
                reportType,
                deviceInfo,
                out mimeType,
                out encoding,
                out fileNameExtension,
                out streams,
                out warnings);
            return File(renderedBytes, mimeType);
        }

    }
}

using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using TimeManagement.DAL;
using TimeManagement.Interfaces;

namespace TimeManagement.Repositories
{
    public class TimeManagementRepository:ITimeManagementRepository
    {
        TimeManagementEntities context = new TimeManagementEntities();
        public List<TimeSheet> GetAll()
        {
            List<TimeSheet> lista = context.TimeSheet.Where(x => x.IsDeleted == false).ToList();
            return lista;
        }
        public TimeSheet Get(int timesheetID)
        {
            return context.TimeSheet.Where(x => x.ID == timesheetID).SingleOrDefault();
        }
        public void Add(TimeSheet timesheet)
        {
            timesheet.DateOfSheet = timesheet.DateOfSheet;
            timesheet.IsDeleted = false;
            timesheet.CreatedDate = DateTime.Now;
            context.TimeSheet.Add(timesheet);
            context.SaveChanges();
        }
        public void Remove(int timesheetID)
        {
            TimeSheet timesheet = context.TimeSheet.Where(x => x.ID == timesheetID).SingleOrDefault();
            timesheet.IsDeleted = true;
            context.SaveChanges();
        }
        public void Update(TimeSheet timesheet)
        {
            //context.Entry(timesheet).State = EntityState.Modified;
            var currentTimesheet = context.TimeSheet.Find(timesheet.ID);
            context.Entry(currentTimesheet).CurrentValues.SetValues(timesheet);
            context.SaveChanges();
        }
    }
}
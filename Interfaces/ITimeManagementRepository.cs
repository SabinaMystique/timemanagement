using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TimeManagement.DAL;

namespace TimeManagement.Interfaces
{
    interface ITimeManagementRepository
    {
        List<TimeSheet> GetAll();
        TimeSheet Get(int TimeSheetID);
        void Add(TimeSheet timesheet);
        void Remove(int TimeSheetID);
        void Update(TimeSheet timesheet);
    }
}


using System;
using System.Collections.Generic;
using System.Linq;
using Siemens.SimaticIT.Unified.Common;
using Siemens.SimaticIT.Unified.Common.Information;
using Siemens.SimaticIT.Handler;
using Siemens.SimaticIT.Unified;
using Siemens.Mom.Presales.Training.DemoApp.DemoApp.DAPOMModel.DataModel.ReadingModel;
using Siemens.Mom.Presales.Training.DemoApp.DemoApp.DAPOMModel.Types;

namespace Siemens.Mom.Presales.Training.DemoApp.DemoApp.DAPOMModel.ReadingFunctions
{
    /// <summary>
    /// Partial class init
    /// </summary>
    [Handler(HandlerCategory.BasicMethod)]
    public partial class GetPersonsHandlerShell 
    {
        /// <summary>
        /// This is the handler the MES engineer should write
        /// This is the ENTRY POINT for the user in VS IDE
        /// </summary>
        /// <param name="readingFunction"></param>
        /// <returns></returns>
        [HandlerEntryPoint]
        private FunctionResponse<GetPersons.FunctionResponse> GetPersonsHandler(GetPersons readingFunction)
        {
            var persons = Platform.ProjectionQuery<Person>().Where(x => x.FirstName == readingFunction.FirstName).Select(x=>
            new GetPersons.FunctionResponse
            {
                 Data = new PersonType
                 {
                      Age = x.Age == null ? 0 : x.Age.Value,
                      Birthday = x.Birthday.Value,
                      FirstName = x.FirstName,
                      IsActive = x.IsActive.Value,
                      LastName = x.LastName,
                      Sex = x.Sex.Value
                 }
            });

            return new FunctionResponse<GetPersons.FunctionResponse>
            {
                Data = persons.AsQueryable()
            };
                     
        }
    }
}

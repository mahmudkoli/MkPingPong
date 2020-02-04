using MkPingPong.Application.TodoLists.Queries.ExportTodos;
using System.Collections.Generic;

namespace MkPingPong.Application.Common.Interfaces
{
    public interface ICsvFileBuilder
    {
        byte[] BuildTodoItemsFile(IEnumerable<TodoItemRecord> records);
    }
}

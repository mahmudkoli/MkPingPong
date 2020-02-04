using MkPingPong.Application.Common.Mappings;
using MkPingPong.Domain.Entities;

namespace MkPingPong.Application.TodoLists.Queries.ExportTodos
{
    public class TodoItemRecord : IMapFrom<TodoItem>
    {
        public string Title { get; set; }

        public bool Done { get; set; }
    }
}

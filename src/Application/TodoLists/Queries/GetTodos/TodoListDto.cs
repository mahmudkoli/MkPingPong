﻿using MkPingPong.Application.Common.Mappings;
using MkPingPong.Domain.Entities;
using System.Collections.Generic;

namespace MkPingPong.Application.TodoLists.Queries.GetTodos
{
    public class TodoListDto : IMapFrom<TodoList>
{
    public TodoListDto()
    {
        Items = new List<TodoItemDto>();
    }

    public int Id { get; set; }

    public string Title { get; set; }

    public IList<TodoItemDto> Items { get; set; }
}
}

using MkPingPong.Application.Common.Behaviours;
using MkPingPong.Application.Common.Interfaces;
using MkPingPong.Application.TodoItems.Commands.CreateTodoItem;
using MediatR.Pipeline;
using Microsoft.Extensions.Logging;
using Moq;
using System.Threading;
using Xunit;
using System;

namespace MkPingPong.Application.UnitTests.Common.Behaviours
{
    public class BehaviourTests
    {
        private readonly Guid UserId = Guid.Empty;
        private const string UserName = "jason.taylor";

        public BehaviourTests()
        {
        }

        [Fact]
        public void RequestLogger_Should_Call_GetUserNameAsync_Once_If_Authenticated()
        {
            var logger = new Mock<ILogger<CreateTodoItemCommand>>();
            var currentUserService = new Mock<ICurrentUserService>();
            var identityService = new Mock<IIdentityService>();

            currentUserService.Setup(x => x.UserId).Returns(UserId);

            IRequestPreProcessor<CreateTodoItemCommand> requestLogger = new RequestLogger<CreateTodoItemCommand>(logger.Object, currentUserService.Object, identityService.Object);

            requestLogger.Process(new CreateTodoItemCommand { ListId = 1, Title = "title" }, new CancellationToken());

            identityService.Verify(i => i.GetUserNameAsync(UserId), Times.Once);
        }

        [Fact]
        public void RequestLogger_Should_Not_Call_GetUserNameAsync_Once_If_Unauthenticated()
        {
            var logger = new Mock<ILogger<CreateTodoItemCommand>>();
            var currentUserService = new Mock<ICurrentUserService>();
            var identityService = new Mock<IIdentityService>();

            currentUserService.Setup(x => x.UserId).Returns(Guid.Empty);

            IRequestPreProcessor<CreateTodoItemCommand> requestLogger = new RequestLogger<CreateTodoItemCommand>(logger.Object, currentUserService.Object, identityService.Object);

            requestLogger.Process(new CreateTodoItemCommand { ListId = 1, Title = "title" }, new CancellationToken());

            identityService.Verify(i => i.GetUserNameAsync(Guid.Empty), Times.Never);
        }
    }
}

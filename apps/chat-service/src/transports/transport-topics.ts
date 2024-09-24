export enum TransportTopics {
  createGroup = "group.create.command",
  groupCreated = "group.created.event",
  joinGroup = "group.join.command",
  userJoinedGroup = "group.user-joined.event",
  userAddedToGroup = "group.user-added.event",
  sendGroupMessage = "group.send-message.command",
  groupMessageSent = "group.message-sent.event",
  removeGroup = "group.remove.command",
  groupRemoved = "group.removed.event",
  leaveGroup = "group.leave.command",
}

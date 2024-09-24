import { Server as IoServer } from 'socket.io';
import { GroupsRepository } from '../groups/groups.repository';
import { GroupsService } from '../groups/groups.service';
import { GroupsController } from '../groups/groups.controller';
import { SocketIoTransport } from '../transports/socketio.transport';
import { UserSocketsMapper } from '../transports/sokets-mapper';
import { AuthService } from '@ws-chat/auth';

export type ServiceTypes = {
  io: IoServer;
  GroupsRepository: GroupsRepository;
  GroupsService: GroupsService;
  GroupsController: GroupsController;
  SocketIoTransport: SocketIoTransport;
  UserSocketsMapper: UserSocketsMapper;
  Transport: SocketIoTransport;
  AuthService: AuthService;
};

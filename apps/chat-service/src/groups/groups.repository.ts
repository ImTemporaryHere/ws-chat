import { ICreateGroup } from './interfaces/create-group.interface';
import mongoose, { HydratedDocument, PipelineStage } from 'mongoose';
import { Group, GroupModel } from '@ws-chat/db-models';

export class GroupsRepository {
  create(group: ICreateGroup) {
    const newGroup = new GroupModel({
      ...group,
      participantsId: group.participantsId.map(
        (id) => new mongoose.Types.ObjectId(id)
      ),
      ownerId: new mongoose.Types.ObjectId(group.ownerId),
    });
    return newGroup.save();
  }

  findOne(groupData: Partial<Group>) {
    return GroupModel.findOne(groupData).exec();
  }

  findAll() {
    return GroupModel.find({}).exec();
  }

  remove(groupId: string) {
    return GroupModel.findOneAndDelete({ _id: groupId }).exec();
  }

  updateOne(group: ICreateGroup) {
    return GroupModel.findOneAndUpdate({ group });
  }

  leaveGroup(userId: string, groupId: string) {
    return GroupModel.findByIdAndUpdate(
      groupId,
      { $pull: { participantsId: userId } }
      // { new: true } // Optional: returns the updated document
    ).exec();
  }

  joinGroup(userId: string, groupId: string) {
    return GroupModel.findByIdAndUpdate(groupId, {
      $push: {
        participantsId: new mongoose.Types.ObjectId(userId),
      },
    }).exec();
  }
}

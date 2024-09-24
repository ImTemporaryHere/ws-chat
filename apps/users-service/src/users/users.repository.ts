import { User, UserModel } from '@ws-chat/db-models';

export class UsersRepository {
  create(userData: User) {
    const newUser = new UserModel(userData);
    return newUser.save();
  }

  find() {
    return UserModel.find().exec();
  }

  findOne(params: Partial<User>) {
    return UserModel.findOne(params).exec();
  }

  deleteOne(userId: string) {
    return UserModel.findByIdAndDelete(userId).exec();
  }
}

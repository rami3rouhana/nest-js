import { Document, Schema, Model, model } from 'mongoose';

export interface User {
  username: string;
  password: string;
  role: Roles;
}

export enum Roles {
  admin = 'admin',
  user = 'user',
}

export interface UserDocument extends User, Document {}

export interface UserModel extends Model<UserDocument> {}

export const UserSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: Object.values(Roles),
    default: Roles.user,
  },
});

export const UserClass = model<UserDocument, UserModel>('User', UserSchema);

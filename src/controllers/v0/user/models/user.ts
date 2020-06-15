import { Schema, Document, model } from 'mongoose';

export interface IUserBase {
  username: string,
  threshold: number
}

export interface IUser extends Document, IUserBase { }

const UserSchema = new Schema ({
  username: { type: String, required: true },
  threshold: { type: Number, default: 0 } 
}, {collection: 'user'});

export default model<IUser>('user', UserSchema);
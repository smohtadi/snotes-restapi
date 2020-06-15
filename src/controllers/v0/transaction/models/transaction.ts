import mongoose, { Schema, Document } from 'mongoose';

export interface ITransactionBase {
  amount: number,
  date: Date,
  description: string,
  type: string,
  uid: string,
}

export interface ITransaction extends ITransactionBase, Document { }

const transactionSchema = new Schema ({
  amount: { type: Number },
  date: { type: Date, default: Date.now },
  description: { type: String },
  type: { type: String, required: true },
  uid: { type: String, required: true },
}, { collection: 'transaction' });

export default mongoose.model<ITransaction>('transaction', transactionSchema);
import { Router, Request, Response } from "express";
import sanitize from 'mongo-sanitize';
import Transaction, { ITransaction, ITransactionBase } from '../models/transaction';

const router: Router = Router();

/**
 * Report Route.
 * URI: /report/q?uid=&type=&yearFrom=&monthFrom=6&
 * yearTo=&monthTo= 
 */
router.get('/report/q?', async (req: Request, res: Response) => {
  try {
    let yearFrom: number = parseInt(req.query.yearFrom + ""),
    monthFrom: number = parseInt(req.query.monthFrom + ""),
    yearTo: number = parseInt(req.query.yearTo + ""),
    monthTo: number = parseInt(req.query.monthTo + ""), 
    type = sanitize(req.query.type),
    uid = sanitize(req.query.uid);
    if (!type || !uid)
      throw new Error("Invalid user ID or type");
    const dateFrom: Date = new Date(yearFrom, monthFrom, 1);
    const dateTo:Date = new Date(yearTo, monthTo, 1);
    const transactions: ITransaction[] = await Transaction.aggregate([
      { $match: {
        type, uid,
        date: { $gte: dateFrom, $lte: dateTo } } },
      { $group: {
        _id: { year: { $year: '$date' }, month: { $month: '$date' } },
        amount: { $sum: '$amount' } }
      },
      { $sort: { "_id.year": 1, "_id.month": 1} }
    ]);
    res.status(200).json(transactions);
  } catch (error) {
    res.status(404).send(error);
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  if (req.params.id) await getTransactionById(req, res, req.params.id);
  else if (req.params.uid) await getTransactionsByUserID(req, res, req.params.uid);
  else return res.status(400).json({ message: "Invalid params" }); 
});

/**
 * POST create transaction
 */
router.post('/create/', async (req: Request, res: Response) => {
  try {
    const sanitized_transaction: ITransactionBase = sanitizeTransaction(req.body);
    const transaction: ITransaction = new Transaction(sanitized_transaction);
    const saved_transaction = await transaction.save();
    res.status(201).json(saved_transaction);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.put('/update/:id ', async (req, res) => {
  try {
    // TODO: CHECK if userID from session === userId from transaction
    let sanitized_transaction: ITransactionBase = sanitizeTransaction(req.body);
    let id = sanitize(req.params.id);
    let updated_transaction = await Transaction.updateOne({ _id: id}, { $set: sanitized_transaction })
    res.status(200).json(updated_transaction);
  } catch (error) {
    res.status(404).json(error);
  }
});

function sanitizeTransaction(t: any) : ITransactionBase {
  let amount: number = parseFloat(t.amount),
  date: Date = sanitize(t.date),
  description: string = sanitize(t.description),
  type: string = sanitize(t.type),
  uid: string = sanitize(t.uid);
  return { amount, date, description, type, uid }; 
}

router.delete('/delete/:id', async (req: Request, res: Response) => {
  try {
    let id = sanitize(req.params.id);
    const deleted_transaction = await Transaction.findOneAndDelete({_id: id });
    res.status(200).json(deleted_transaction);
  } catch (error) {
    res.status(404).json(error);
  }
});

async function getTransactionById (req: Request, res: Response, id: string) {
  try {
    const transactionID = sanitize(id);
    const transaction: ITransaction = await Transaction.findById(transactionID);
    return res.status(200).json(transaction);
  } catch (error) {
    res.status(404).send(error)
  }
}

async function getTransactionsByUserID(req: Request, res: Response, userID: string) {
  try {
    const uid: string = sanitize(userID);
    const transactions: ITransaction[] = await Transaction.find({ uid }).sort({ date: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(404).send(error);
  }
}

export const TransactionRouter: Router = router;
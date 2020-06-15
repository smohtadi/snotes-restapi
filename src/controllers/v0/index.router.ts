import { Router, Request, Response } from "express";
import { TransactionRouter } from './transaction/routers/transaction.router';

const router: Router = Router();
router.use("/transaction", TransactionRouter);
router.use("/user", "UserRouter");
router.get("/", async(req: Request, res: Response) => {
    res.send("V0");
});
export const IndexRouter: Router = router;
import express, { Response, Request } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';

import { config as c } from './config/config';

(async () => {
    const app = express();
    const PORT = process.env.PORT || 5000;
    mongoose.connect(c.MONGO_URI, { useNewUrlParser: true });

    app.use(bodyParser.json());
    app.use(cors());
    app.use("/api/v0/", IndexRouter);
    app.get("/", async(req: Request, res: Response) => {
        res.send("/api/v0/");
    });
    app.listen(PORT, function() {
        console.log( `server running http://localhost:${ PORT }` );
        console.log( `press CTRL+C to stop server` );
    });
})();
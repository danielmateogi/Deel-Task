import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { admin, balances, contracts, jobs, profile } from './modules';
import errorHandler from './middleware/errorHandler';

const app = express();
app.use(bodyParser.json());
/** Needed for using the demo frontend, in production would need to be configured for the allowed domains */
app.use(cors());

app.use('/admin', admin);
app.use('/balances', balances);
app.use('/contracts', contracts);
app.use('/jobs', jobs);
app.use('/profile', profile);

app.use(errorHandler);

export default app;

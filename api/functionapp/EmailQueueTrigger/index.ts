import type { AzureFunction, Context } from '@azure/functions';
import sgMail from '@sendgrid/mail';
import { SENDGRID_API_KEY } from '../../src/config/env';

sgMail.setApiKey(SENDGRID_API_KEY);

interface EmailJob { to: string; subject: string; html: string; }

const queueTrigger: AzureFunction = async (context: Context, msg: EmailJob) => {
  await sgMail.send({ ...msg, from: 'no-reply@salescat.dev' });
  context.log(`Sent e-mail to ${msg.to}`);
};

export default queueTrigger;

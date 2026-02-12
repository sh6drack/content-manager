/**
 * AWS SES Email Client
 *
 * Drop-in replacement for Resend. All outreach scripts import sendEmail
 * from this module instead of using the Resend SDK directly.
 *
 * On EC2: credentials come from the instance IAM role automatically.
 * Locally: credentials come from ~/.aws/credentials or env vars.
 */

import {
  SESClient,
  SendEmailCommand,
  type SendEmailCommandInput,
  type MessageTag,
} from "@aws-sdk/client-ses";

let _client: SESClient | null = null;

function getClient(): SESClient {
  if (!_client) {
    _client = new SESClient({
      region: process.env.AWS_REGION || "us-east-2",
    });
  }
  return _client;
}

interface SendEmailOptions {
  from: string;
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  tags?: { name: string; value: string }[];
}

interface SendEmailResult {
  data: { id: string } | null;
}

export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const { from, to, subject, html, text, tags } = options;
  const toAddresses = Array.isArray(to) ? to : [to];

  const input: SendEmailCommandInput = {
    Source: from,
    Destination: { ToAddresses: toAddresses },
    Message: {
      Subject: { Data: subject, Charset: "UTF-8" },
      Body: {},
    },
  };

  if (html) {
    input.Message!.Body!.Html = { Data: html, Charset: "UTF-8" };
  }
  if (text) {
    input.Message!.Body!.Text = { Data: text, Charset: "UTF-8" };
  }
  if (tags && tags.length > 0) {
    input.Tags = tags.map((t): MessageTag => ({ Name: t.name, Value: t.value }));
  }

  const response = await getClient().send(new SendEmailCommand(input));

  return {
    data: response.MessageId ? { id: response.MessageId } : null,
  };
}

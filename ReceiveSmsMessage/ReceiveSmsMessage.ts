import type { WebhookFunction } from '@8base/functions-types';

import { ActivityLogType, VerificationRequestStatus } from '@REDACTED/constants';
import { gqlApi } from '@REDACTED/graphql/server';

import { DEFAULT_HTTP_RESPONSE } from 'src/constants';
import type { SmsEventData } from 'src/types/twilio';
import { withSentry } from 'src/utils/sentry';
import { getUserFullName } from 'src/utils/user';

const receiveSmsMessage: WebhookFunction = async (event, ctx) => {
  try {
    const api = gqlApi(ctx);
    // NOTE: we have to do this since Twilio sends us a form
    const eventData: SmsEventData = new URLSearchParams(event.body);
    const userPhoneNumber = eventData.get('From')!.replace(/["]+/g, '');
    const messageText = eventData.get('Body')!.toLowerCase().replace(/["]+/g, '');

    const { consumersList } = await api.ConsumersList(
      {
        filter: {
          user: {
            phoneNumber: { equals: userPhoneNumber },
          },
        },
      },
      { checkPermissions: false },
    );

    const consumer = consumersList.items[0];

    if (!consumer) {
      console.error('Consumer not found');
      return DEFAULT_HTTP_RESPONSE;
    }

    const verificationRequest =
      consumer.inboxItems?.items[consumer.inboxItems.items.length - 1]?.verificationRequest;

    if (!verificationRequest) {
      console.error('Verification request not found');
      return DEFAULT_HTTP_RESPONSE;
    }

    switch (messageText) {
      case 'approve':
        await api.VerificationRequestUpdate(
          {
            data: {
              status: VerificationRequestStatus.ReportCreated,
              inboxItem: {
                update: {
                  activityLogs: {
                    create: [
                      {
                        type: ActivityLogType.Accepted,
                        heading: `approved request`,
                        authorDisplayName: getUserFullName(),
                      },
                    ],
                  },
                },
              },
            },
            filter: { id: String(verificationRequest.id) },
          },
          { checkPermissions: false },
        );
        await api.GenerateVerificationReport({
          data: {
            verificationRequestId: verificationRequest.id || '',
          },
        });
        return DEFAULT_HTTP_RESPONSE;

      case 'decline':
        await api.VerificationRequestUpdate(
          {
            data: {
              status: VerificationRequestStatus.DeclinedByConsumer,
              inboxItem: {
                update: {
                  activityLogs: {
                    create: [
                      {
                        type: ActivityLogType.Declined,
                        heading: `declined request`,
                        authorDisplayName: getUserFullName(),
                      },
                    ],
                  },
                },
              },
            },
            filter: { id: String(verificationRequest.id) },
          },
          { checkPermissions: false },
        );
        return DEFAULT_HTTP_RESPONSE;

      default:
        console.error(`Received message could not be processed, received: ${messageText}`);
        return DEFAULT_HTTP_RESPONSE;
    }
  } catch (err) {
    console.error(`Could not update verification request: ${JSON.stringify(err)}`);
    return DEFAULT_HTTP_RESPONSE;
  }
};

export default withSentry(receiveSmsMessage);
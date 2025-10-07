/**
 * Minimal Azure AI Foundry Agent client.
 * Reads env: AZURE_AI_API_KEY, AZURE_AI_AGENT_ID, AZURE_AI_ENDPOINT
 * Exposes askAzureAgent(url, scenario) -> { code, meta }
 */

import { DefaultAzureCredential } from '@azure/identity';
import {
  AgentsClient,
  RunStreamEvent,
  ErrorEvent,
  DoneEvent,
} from '@azure/ai-agents';

const projectEndpoint = process.env.AZURE_AI_ENDPOINT;
const client = new AgentsClient(projectEndpoint, new DefaultAzureCredential());
const agentId = process.env.AZURE_AI_AGENT_ID;

export async function askAzureAgent(messages, threadId) {
  const thread = threadId ? { id: threadId } : await client.threads.create();

  const streamEventMessages = await client.runs
    .create(thread.id, agentId, {
      additionalMessages: messages,
    })
    .stream();

  let statusMessage = '';

  for await (const eventMessage of streamEventMessages) {
    switch (eventMessage.event) {
      case RunStreamEvent.ThreadRunCreated:
        console.log(`ThreadRun status: ${eventMessage.data.status}`);
        statusMessage = 'queued';
        break;
      case RunStreamEvent.ThreadRunCompleted:
        statusMessage = 'completed';
        console.log('Thread Run Completed');
        break;
      case ErrorEvent.Error:
        statusMessage = 'error';
        console.log(`An error occurred. Data ${eventMessage.data}`);
        break;
      case DoneEvent.Done:
        statusMessage = 'done';
        console.log('Stream completed.');
        break;
    }
  }

  console.log('>>> statusMessage:', statusMessage);

  const messagesIterator = await client.messages.list(thread.id);
  if (statusMessage === 'done') {
    const allMessages = [];
    for await (const m of messagesIterator) {
      allMessages.push(m);
    }
    console.log('>>> info:', {
      allMessages: allMessages,
      threadId: thread.id,
      agentMessage: allMessages[0].content,
    });
    return {
      allMessages: allMessages,
      threadId: thread.id,
      agentMessage: allMessages[0].content,
    };
  } else {
    throw 'Something went wrong! Please try again!';
  }
}

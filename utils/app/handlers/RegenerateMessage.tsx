import { MutableRefObject } from 'react';
import toast from 'react-hot-toast';

import { storageCreateMessage } from '@/utils/app/storage/message';
import { saveSelectedConversation } from '@/utils/app/storage/selectedConversation';
import { getTimestampWithTimezoneOffset } from '@chatbot-ui/core/utils/time';

import { Plugin, PluginKey } from '@/types/plugin';
import { User } from '@chatbot-ui/core/types/auth';
import { Conversation, Message } from '@chatbot-ui/core/types/chat';

import { sendChatRequest } from '../chat';
import { storageDeleteMessages } from '../storage/messages';

import { Database } from '@chatbot-ui/core';
import { v4 as uuidv4 } from 'uuid';

export const regenerateMessageHandler = async (
  user: User,
  plugin: Plugin | null = null,
  stopConversationRef: MutableRefObject<boolean>,
  selectedConversation: Conversation | undefined,
  conversations: Conversation[],
  database: Database,
  apiKey: string,
  pluginKeys: PluginKey[],
  homeDispatch: React.Dispatch<any>,
) => {
  if (selectedConversation) {
    const deleteCount = 1;
    let updatedConversation: Conversation;

    const conversationLength = selectedConversation.messages.length;
    const messagesToBeDeleted: string[] = [];

    for (let i = 0; i < deleteCount; i++) {
      const currentMessage =
        selectedConversation.messages[conversationLength - 1 - i];
      messagesToBeDeleted.push(currentMessage.id);
    }
    const deleteUpdate = storageDeleteMessages(
      database,
      user,
      messagesToBeDeleted,
      selectedConversation,
      selectedConversation.messages,
      conversations,
    );

    updatedConversation = deleteUpdate.single;

    homeDispatch({
      field: 'selectedConversation',
      value: updatedConversation,
    });

    homeDispatch({ field: 'loading', value: true });
    homeDispatch({ field: 'messageIsStreaming', value: true });

    const { response, controller } = await sendChatRequest(
      updatedConversation,
      plugin,
      apiKey,
      pluginKeys,
    );

    if (!response.ok) {
      homeDispatch({ field: 'loading', value: false });
      homeDispatch({ field: 'messageIsStreaming', value: false });
      toast.error(response.statusText);
      return;
    }
    const data = response.body;
    if (!data) {
      homeDispatch({ field: 'loading', value: false });
      homeDispatch({ field: 'messageIsStreaming', value: false });
      return;
    }

    const assistantMessageId = uuidv4();
    const responseMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: getTimestampWithTimezoneOffset(),
    };
    if (!plugin) {
      homeDispatch({ field: 'loading', value: false });
      const reader = data.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let text = '';

      updatedConversation.messages.push(responseMessage);
      const length = updatedConversation.messages.length;
      while (!done) {
        if (stopConversationRef.current === true) {
          controller.abort();
          done = true;
          break;
        }
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        text += chunkValue;

        updatedConversation.messages[length - 1].content = text;

        homeDispatch({
          field: 'selectedConversation',
          value: updatedConversation,
        });
      }

      updatedConversation.messages.pop();
    } else {
      const { answer } = await response.json();
      responseMessage.content = answer;
    }

    homeDispatch({ field: 'loading', value: false });
    homeDispatch({ field: 'messageIsStreaming', value: false });

    // Saving the response message
    const { single, all } = storageCreateMessage(
      database,
      user,
      updatedConversation,
      responseMessage,
      conversations,
    );

    homeDispatch({
      field: 'selectedConversation',
      value: single,
    });

    homeDispatch({ field: 'conversations', value: all });
    saveSelectedConversation(user, single);
  }
};

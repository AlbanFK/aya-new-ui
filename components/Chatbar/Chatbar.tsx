import { useCallback, useContext, useEffect } from 'react';

import { useTranslation } from 'next-i18next';

import { useCreateReducer } from '@/hooks/useCreateReducer';

import { DEFAULT_SYSTEM_PROMPT, DEFAULT_TEMPERATURE } from '@/utils/app/const';
import { exportData, importData } from '@/utils/app/importExport';
import { storageDeleteConversation } from '@/utils/app/storage/conversation';
import { storageDeleteConversations } from '@/utils/app/storage/conversations';
import {
  storageDeleteFolders,
  storageUpdateFolders,
} from '@/utils/app/storage/folders';
import { localSaveAPIKey } from '@/utils/app/storage/local/apiKey';
import {
  localDeletePluginKeys,
  localSavePluginKeys,
} from '@/utils/app/storage/local/pluginKeys';
import { localSaveShowChatBar } from '@/utils/app/storage/local/uiState';
import {
  deleteSelectedConversation,
  saveSelectedConversation,
} from '@/utils/app/storage/selectedConversation';

import { LatestExportFormat, SupportedExportFormats } from '@/types/export';
import { OpenAIModels } from '@/types/openai';
import { PluginKey } from '@/types/plugin';
import { Conversation } from '@chatbot-ui/core/types/chat';

import HomeContext from '@/pages/api/home/home.context';

import { ChatFolders } from './components/ChatFolders';
import { ChatbarSettings } from './components/ChatbarSettings';
import { Conversations } from './components/Conversations';

import Sidebar from '../Sidebar';
import ChatbarContext from './Chatbar.context';
import { ChatbarInitialState, initialState } from './Chatbar.state';

import { Database } from '@chatbot-ui/core';
import { v4 as uuidv4 } from 'uuid';

import {
  storageGetConversations,
  storageUpdateConversations,
} from '@/utils/app/storage/conversations';


export const Chatbar = () => {
  const { t } = useTranslation('sidebar');

  const chatBarContextValue = useCreateReducer<ChatbarInitialState>({
    initialState,
  });

  const {
    state: {
      conversations,
      showChatbar,
      defaultModelId,
      database,
      folders,
      pluginKeys,
      user,
    },
    dispatch: homeDispatch,
    handleCreateFolder,
    handleNewConversation,
    handleUpdateConversation,
  } = useContext(HomeContext);

  const {
    state: { searchTerm, filteredConversations },
    dispatch: chatDispatch,
  } = chatBarContextValue;

  const handleApiKeyChange = useCallback(
    (apiKey: string) => {
      homeDispatch({ field: 'apiKey', value: apiKey });

      localSaveAPIKey(user, apiKey);
    },
    [homeDispatch, user],
  );

  const handlePluginKeyChange = (pluginKey: PluginKey) => {
    if (pluginKeys.some((key) => key.pluginId === pluginKey.pluginId)) {
      const updatedPluginKeys = pluginKeys.map((key) => {
        if (key.pluginId === pluginKey.pluginId) {
          return pluginKey;
        }

        return key;
      });

      homeDispatch({ field: 'pluginKeys', value: updatedPluginKeys });

      localSavePluginKeys(user, updatedPluginKeys);
    } else {
      homeDispatch({ field: 'pluginKeys', value: [...pluginKeys, pluginKey] });

      localSavePluginKeys(user, [...pluginKeys, pluginKey]);
    }
  };

  const handleClearPluginKey = (pluginKey: PluginKey) => {
    const updatedPluginKeys = pluginKeys.filter(
      (key) => key.pluginId !== pluginKey.pluginId,
    );

    if (updatedPluginKeys.length === 0) {
      homeDispatch({ field: 'pluginKeys', value: [] });
      localDeletePluginKeys(user);
      return;
    }

    homeDispatch({ field: 'pluginKeys', value: updatedPluginKeys });
    localSavePluginKeys(user, updatedPluginKeys);
  };

  const handleExportData = (database: Database) => {
    exportData(database, user);
  };

  const handleImportConversations = async (data: SupportedExportFormats) => {
    const { history, folders, prompts }: LatestExportFormat = await importData(
      database,
      user,
      data,
    );
    homeDispatch({ field: 'conversations', value: history });
    homeDispatch({
      field: 'selectedConversation',
      value: history[history.length - 1],
    });
    homeDispatch({ field: 'folders', value: folders });
    homeDispatch({ field: 'prompts', value: prompts });

    window.location.reload();
  };

  const handleClearConversations = async () => {
    defaultModelId &&
      homeDispatch({
        field: 'selectedConversation',
        value: {
          id: uuidv4(),
          name: t('New Conversation'),
          messages: [],
          model: OpenAIModels[defaultModelId],
          prompt: DEFAULT_SYSTEM_PROMPT,
          temperature: DEFAULT_TEMPERATURE,
          folderId: null,
        },
      });

    homeDispatch({ field: 'conversations', value: [] });

    const deletedFolders = folders.filter((f) => f.type === 'chat');

    let deletedFolderIds: string[] = [];
    for (const folder of deletedFolders) {
      deletedFolderIds.push(folder.id);
    }

    await storageDeleteConversations(database, user);
    storageDeleteFolders(database, user, deletedFolderIds);
    deleteSelectedConversation(user);

    const updatedFolders = folders.filter((f) => f.type !== 'chat');

    homeDispatch({ field: 'folders', value: updatedFolders });
    storageUpdateFolders(database, user, updatedFolders);
  };

  const handleDeleteConversation = (conversation: Conversation) => {
    const updatedConversations = storageDeleteConversation(
      database,
      user,
      conversation.id,
      conversations,
    );

    homeDispatch({ field: 'conversations', value: updatedConversations });
    chatDispatch({ field: 'searchTerm', value: '' });

    if (updatedConversations.length > 0) {
      homeDispatch({
        field: 'selectedConversation',
        value: updatedConversations[updatedConversations.length - 1],
      });

      saveSelectedConversation(
        user,
        updatedConversations[updatedConversations.length - 1],
      );
    } else {
      defaultModelId &&
        homeDispatch({
          field: 'selectedConversation',
          value: {
            id: uuidv4(),
            name: t('New Conversation'),
            messages: [],
            model: OpenAIModels[defaultModelId],
            prompt: DEFAULT_SYSTEM_PROMPT,
            temperature: DEFAULT_TEMPERATURE,
            folderId: null,
          },
        });

      deleteSelectedConversation(user);
    }
  };

  const handleToggleChatbar = () => {
    homeDispatch({ field: 'showChatbar', value: !showChatbar });
    localSaveShowChatBar(user, showChatbar);
  };

  const handleDrop = (e: any) => {
    if (e.dataTransfer) {
      const conversation = JSON.parse(e.dataTransfer.getData('conversation'));
      handleUpdateConversation(conversation, { key: 'folderId', value: null });
      chatDispatch({ field: 'searchTerm', value: '' });
      // e.target.style.background = 'none';
    }
  };

  useEffect(() => {
    if (searchTerm) {
      chatDispatch({
        field: 'filteredConversations',
        value: conversations.filter((conversation) => {
          const searchable =
            conversation.name.toLocaleLowerCase() +
            ' ' +
            conversation.messages.map((message) => message.content).join(' ');
          return searchable.toLowerCase().includes(searchTerm.toLowerCase());
        }),
      });
    } else {
      chatDispatch({
        field: 'filteredConversations',
        value: conversations,
      });
    }
  }, [searchTerm, conversations, chatDispatch]);

  useEffect(() => {
    // console.log("mbre" + filteredConversations.length);
    // console.log(filteredConversations);

    storageGetConversations(database, user).then((conversationHistory) => {
      if (conversationHistory) {
        const parsedConversationHistory: Conversation[] = conversationHistory;
        // console.log("chats" + parsedConversationHistory.length);
        if (parsedConversationHistory.length === 0) {
          handleNewConversation()
        }
        

      } 
    });
  }, [filteredConversations])

  return (
    <ChatbarContext.Provider
      value={{
        ...chatBarContextValue,
        handleDeleteConversation,
        handleClearConversations,
        handleImportConversations,
        handleExportData,
        handlePluginKeyChange,
        handleClearPluginKey,
        handleApiKeyChange,
      }}
    >
      <Sidebar<Conversation>
        side={'left'}
        isOpen={showChatbar}
        addItemButtonTitle={t('New chat')}
        itemComponent={<Conversations conversations={filteredConversations} />}
        folderComponent={<ChatFolders searchTerm={searchTerm} />}
        items={filteredConversations}
        searchTerm={searchTerm}
        handleSearchTerm={(searchTerm: string) =>
          chatDispatch({ field: 'searchTerm', value: searchTerm })
        }
        toggleOpen={handleToggleChatbar}
        handleCreateItem={handleNewConversation}
        handleCreateFolder={() => handleCreateFolder(t('New folder'), 'chat', '')}
        handleDrop={handleDrop}
        footerComponent={<ChatbarSettings />}
      />
    </ChatbarContext.Provider>
  );
};

import { useContext } from 'react';

import { FolderInterface } from '@chatbot-ui/core/types/folder';

import HomeContext from '@/pages/api/home/home.context';

import Folder from '@/components/Folder';

import { ConversationComponent } from './Conversation';

import { IconPlus } from '@tabler/icons-react';

interface Props {
  searchTerm: string;
}

export const ChatFolders = ({ searchTerm }: Props) => {
  const {
    state: { folders, conversations },
    handleUpdateConversation,
  } = useContext(HomeContext);

  const handleDrop = (e: any, folder: FolderInterface) => {
    if (e.dataTransfer) {
      const conversation = JSON.parse(e.dataTransfer.getData('conversation'));
      handleUpdateConversation(conversation, {
        key: 'folderId',
        value: folder.id,
      });
    }
  };

  const ChatFolders = (currentFolder: FolderInterface) => {
    return (
      conversations &&
      conversations
        .filter((conversation) => conversation.folderId)
        .map((conversation, index) => {
          if (conversation.folderId === currentFolder.id) {
            return (
              <div key={index} className="ml-4 gap-2 border-l-2 border-gray-700 pl-2 pt-1">
                <ConversationComponent conversation={conversation} />
              </div>
            );
          }
        })
    );
  };

  return (
    <div className="flex w-full flex-col gap-2 pt-2">
      
      {folders
        .filter((folder) => folder.type === 'chat')
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((folder, index) => (
          <Folder
            key={index}
            searchTerm={searchTerm}
            currentFolder={folder}
            handleDrop={handleDrop}
            folderComponent={ChatFolders(folder)}
          />
        ))}
    </div>
  );
};

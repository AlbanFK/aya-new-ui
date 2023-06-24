import { IconFileExport, IconLogout, IconSettings, IconChevronDown } from '@tabler/icons-react';
import { signOut } from 'next-auth/react';
import { useContext, useState } from 'react';

import { useTranslation } from 'next-i18next';

import { localDeleteAPIKey } from '@/utils/app/storage/local/apiKey';
import { localDeletePluginKeys } from '@/utils/app/storage/local/pluginKeys';
import { deleteSelectedConversation } from '@/utils/app/storage/selectedConversation';
import { AUTH_ENABLED } from '@chatbot-ui/core/utils/const';

import HomeContext from '@/pages/api/home/home.context';

import { SettingDialog } from '@/components/Settings/SettingDialog';

import { Import } from '../../Settings/Import';
import { Key } from '../../Settings/Key';
import { SidebarButton } from '../../Sidebar/SidebarButton';
import ChatbarContext from '../Chatbar.context';
import { ClearConversations } from './ClearConversations';
import { PluginKeys } from './PluginKeys';

export const ChatbarSettings = () => {
  const { t } = useTranslation('sidebar');
  const [isSettingDialogOpen, setIsSettingDialog] = useState<boolean>(false);

  const {
    state: {
      apiKey,
      database,
      serverSideApiKeyIsSet,
      serverSidePluginKeysSet,
      conversations,
      user,
    },
    dispatch: homeDispatch,
  } = useContext(HomeContext);

  const handleSignOut = () => {
    if (database.name !== 'local') {
      deleteSelectedConversation(user);
      localDeleteAPIKey(user);
      localDeletePluginKeys(user);
    }

    signOut();
  };

  const {
    handleClearConversations,
    handleImportConversations,
    handleExportData,
    handleApiKeyChange,
  } = useContext(ChatbarContext);

  const [isFooterOpen, setIsFooterOpen] = useState<boolean>(true);

  return (
    <>
      <div
        className={`fill-white hover:bg-gray-500/10 transition-colors duration-200 px-3 rounded-md cursor-pointer flex justify-center`}
        onClick={() => setIsFooterOpen(!isFooterOpen)}
      >
        <IconChevronDown className={` transition-all duration-200 ${
          isFooterOpen ? '' : 'rotate-180'
        }`}/>
      </div>
      <div className={`flex flex-col items-center space-y-1  pt-1 text-sm ${isFooterOpen ? '' : 'max-h-0'}`}>
        {conversations.length > 0 ? (
          <ClearConversations onClearConversations={handleClearConversations} />
        ) : null}

        <Import onImport={handleImportConversations} />

        <SidebarButton
          text={t('Export data')}
          icon={<IconFileExport size={18} />}
          onClick={() => handleExportData(database)}
        />

        <SidebarButton
          text={t('Settings')}
          icon={<IconSettings size={18} />}
          onClick={() => setIsSettingDialog(true)}
        />

        {!serverSideApiKeyIsSet ? (
          <Key apiKey={apiKey} onApiKeyChange={handleApiKeyChange} />
        ) : null}

        {!serverSidePluginKeysSet ? <PluginKeys /> : null}

        {AUTH_ENABLED && (
          <SidebarButton
            text={t('Log Out')}
            icon={<IconLogout size={18} />}
            onClick={handleSignOut}
          />
        )}

        <SettingDialog
          open={isSettingDialogOpen}
          onClose={() => {
            setIsSettingDialog(false);
          }}
        />
      </div>
    </>
  );
};

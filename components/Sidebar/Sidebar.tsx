import { IconFolderPlus, IconMistOff, IconPlus } from '@tabler/icons-react';
import { ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  CloseSidebarButton,
  OpenSidebarButton,
} from './components/OpenCloseButton';

import NewChat from './components/NewChat';

import Search from '../Search';

interface Props<T> {
  isOpen: boolean;
  addItemButtonTitle: string;
  side: 'left' | 'right';
  items: T[];
  itemComponent: ReactNode;
  folderComponent: ReactNode;
  footerComponent?: ReactNode;
  searchTerm: string;
  handleSearchTerm: (searchTerm: string) => void;
  toggleOpen: () => void;
  handleCreateItem: () => void;
  handleCreateFolder: () => void;
  handleDrop: (e: any) => void;
}

const Sidebar = <T,>({
  isOpen,
  addItemButtonTitle,
  side,
  items,
  itemComponent,
  folderComponent,
  footerComponent,
  searchTerm,
  handleSearchTerm,
  toggleOpen,
  handleCreateItem,
  handleCreateFolder,
  handleDrop,
}: Props<T>) => {
  const { t } = useTranslation('promptbar');

  const [isDragEnter, setIsDragEnter] = useState<boolean>(false);



  const allowDrop = (e: any) => {
    e.preventDefault();
    setIsDragEnter(true)
  };

  const highlightDrop = (e: any) => {
    // e.target.style.background = '#343541';
    setIsDragEnter(true)
  };

  const removeHighlight = (e: any) => {
    // e.target.style.background = 'none';
    setIsDragEnter(false)
  };
  const bigHandleDrop = (e: any) => {
    handleDrop(e);
    setIsDragEnter(false);
  }
  

  return isOpen ? (
    <div>
      <div
        className={`fixed top-0 ${side}-0 z-40 flex h-full w-[260px]  flex-col space-y-2 bg-gray-900 p-2 text-[14px] transition-all sm:relative sm:top-0`}
      >
        <div className="flex justify-center items-center">
          {/* <button
            className="text-sidebar text-sm flex w-[190px] flex-shrink-0 cursor-pointer select-none items-center gap-3 rounded-md border border-white/20 p-3 text-gray-100 transition-colors duration-200 hover:bg-gray-500/10"
            onClick={() => {
              handleCreateItem();
              handleSearchTerm('');
            }}
          >
            <IconPlus size={16} />
            {addItemButtonTitle}
          </button> */}

          <NewChat 
            addTitle={addItemButtonTitle} 
            handleCreate={handleCreateItem} 
            handleSearch={handleSearchTerm}
          />

          <button
            className="ml-2 flex flex-shrink-0 cursor-pointer items-center gap-3 rounded-md border border-white/20 p-3 text-sm text-white transition-colors duration-200 hover:bg-gray-500/10"
            onClick={handleCreateFolder}
          >
            <IconFolderPlus size={16} />
          </button>
        </div>
        <Search
          placeholder={t('Search ...') || ''}
          searchTerm={searchTerm}
          onSearch={handleSearchTerm}
        />

        <div className="flex-grow flex flex-col overflow-auto border-b border-white/20">
          {items?.length > 0 && (
            <div className="flex border-b border-white/20 pb-2">
              {folderComponent}
            </div>
          )}

          {items?.length > 0 ? (
            <div
              className={`pt-2 ${isDragEnter ? `bg-gray-800/40` : ``} flex-grow`}
              onDrop={bigHandleDrop}
              onDragOver={allowDrop}
              onDragEnter={highlightDrop}
              onDragLeave={removeHighlight}
            >
              {itemComponent}
            </div>
          ) : 
          (
            <div className="mt-8 select-none text-center text-white opacity-50">
              <IconMistOff className="mx-auto mb-3" />
              <span className="text-[14px] leading-normal">
                {t('No data.')}
              </span>
            </div>
          )
          }
        </div>
        {footerComponent}
      </div>

      <CloseSidebarButton onClick={toggleOpen} side={side} />
    </div>
  ) : (
    <OpenSidebarButton onClick={toggleOpen} side={side} />
  );
};

export default Sidebar;

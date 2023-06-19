import {
  IconCheck,
  IconPencil,
  IconTrash,
  IconX,
  IconFolder,
  IconChevronDown,
  IconPalette,
  IconRefresh,
  IconPlus
} from '@tabler/icons-react';
import {
  KeyboardEvent,
  ReactElement,
  useContext,
  useEffect,
  useState,
} from 'react';

import { FolderInterface } from '@chatbot-ui/core/types/folder';

import HomeContext from '@/pages/api/home/home.context';

import SidebarActionButton from '@/components/Buttons/SidebarActionButton';

import { folderColorOptions } from '@/utils/app/color'

import { useTranslation } from 'next-i18next';


interface Props {
  currentFolder: FolderInterface;
  searchTerm: string;
  handleDrop: (e: any, folder: FolderInterface) => void;
  folderComponent: (ReactElement | undefined)[];
}

const Folder = ({
  currentFolder,
  searchTerm,
  handleDrop,
  folderComponent,
}: Props) => {
  const { handleDeleteFolder, handleUpdateFolder, handleNewConversation } = useContext(HomeContext);

  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [newColor, setNewColor] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isHover, setIsHover] = useState<boolean>(false);
  const [isDragEnter, setIsDragEnter] = useState<boolean>(false);
  const [showPalette, setShowPalette] = useState<boolean>(false);



  const handleEnterDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRename();
    }
  };

  const handleRename = () => {
    handleUpdateFolder(currentFolder.id, renameValue, currentFolder.color);
    setRenameValue('');
    setIsRenaming(false);
  };

  const updateColor = (_color?: string) => {
    console.log('Folder' + currentFolder.color);
    
    if (_color) {
      setNewColor(_color)
      handleUpdateFolder(currentFolder.id, currentFolder.name, _color);
      console.log('FolderUpdate' + currentFolder.color);
    } else {
      setNewColor('')
      handleUpdateFolder(currentFolder.id, currentFolder.name, '');
    }
    setShowPalette(false)
    setIsHover(false)
  }

  const dropHandler = (e: any) => {
    if (e.dataTransfer) {
      setIsOpen(true);

      handleDrop(e, currentFolder);

      // e.target.style.background = 'none';
      setIsDragEnter(false)
    }
  };

  const allowDrop = (e: any) => {
    e.preventDefault();
    // setIsHover(false);
    setIsDragEnter(true)

  };

  const highlightDrop = (e: any) => {
    setIsDragEnter(true)
    // e.target.style.background = '#343541';
  };

  const removeHighlight = (e: any) => {
    setIsDragEnter(false)
    // e.target.style.background = 'none';
    // setIsHover(false);
  };

 

  useEffect(() => {
    if (isRenaming) {
      setIsDeleting(false);
    } else if (isDeleting) {
      setIsRenaming(false);
    }
  }, [isRenaming, isDeleting]);

  useEffect(() => {
    if (searchTerm) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [searchTerm]);

  const { t } = useTranslation('sidebar');


  return (
    <div className={isDragEnter ? `bg-gray-800/40` : ``}
      onDrop={(e) => {dropHandler(e); setIsHover(false);}}
      onDragOver={allowDrop}
      onDragEnter={highlightDrop}
      onDragLeave={removeHighlight}
    >
      <div className="relative flex items-center "
        onMouseEnter={()=> setIsHover(true)}
        onMouseLeave={()=> setIsHover(false)}
      >
        {isRenaming ? (
          <div className="flex w-full items-center gap-3 bg-[#343541]/90 p-3">
            <IconFolder size={18}/>
            <input
              className="mr-12 flex-1 overflow-hidden overflow-ellipsis border-neutral-400 bg-transparent text-left text-[12.5px] leading-3 text-white outline-none focus:border-neutral-100"
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={handleEnterDown}
              autoFocus
            />
          </div>
        ) : (
          <button
            style={{ background: currentFolder.color || '' }}
            className={`flex w-full cursor-pointer items-center gap-3 rounded-lg p-3 text-sm transition-colors duration-200  ${isHover ? `bg-gray-800/40` : ``}`}
            onClick={() => setIsOpen(!isOpen)}
            
            
            
          >
            <IconFolder size={18}/>
            <div className={`relative ${isHover ? `mr-24` : `mr-6`} max-h-5 flex-1 overflow-hidden text-ellipsis whitespace-nowrap break-all text-left text-[12.5px] leading-3`}>
              {currentFolder.name}
            </div>
          </button>
        )}

        {(isDeleting || isRenaming) && (
          <div className="absolute right-1 z-10 flex text-gray-300">
            <SidebarActionButton
              handleClick={(e) => {
                e.stopPropagation();

                if (isDeleting) {
                  handleDeleteFolder(currentFolder.id);
                } else if (isRenaming) {
                  handleRename();
                }

                setIsDeleting(false);
                setIsRenaming(false);
              }}
            >
              <IconCheck size={18} />
            </SidebarActionButton>
            <SidebarActionButton
              handleClick={(e) => {
                e.stopPropagation();
                setIsDeleting(false);
                setIsRenaming(false);
              }}
            >
              <IconX size={18} />
            </SidebarActionButton>
          </div>
        )}

        {!isDeleting && !isRenaming && (
          <div className="absolute right-1 z-10 flex text-gray-300">
            {isHover && (
              <>
                <SidebarActionButton
                  handleClick={() => setShowPalette(!showPalette)}
                >
                  <IconPalette size={18} />
                </SidebarActionButton>

                {showPalette && (
                  <div className='absolute left-0 bottom-0 translate-y-full p-2 z-20 bg-gray-900 rounded border border-gray-600 flex flex-col gap-2 items-center'>
                    <>
                      {folderColorOptions.map((c) => (
                        <button
                          key={c}
                          style={{ background: c }}
                          className={`hover:scale-90 transition-transform h-4 w-4 rounded-full`}
                          onClick={() => {
                            updateColor(c);
                          }}
                        />
                      ))}
                      <button
                        onClick={() => {
                          updateColor();
                        }}
                      >
                        <IconRefresh size={'16px'}/>
                      </button>
                    </>
                  </div>
                )}

                <SidebarActionButton
                  handleClick={(e) => {
                    e.stopPropagation();
                    setIsRenaming(true);
                    setRenameValue(currentFolder.name);
                  }}
                >
                  <IconPencil size={18} />
                </SidebarActionButton>

                <SidebarActionButton
                  handleClick={(e) => {
                    e.stopPropagation();
                    setIsDeleting(true);
                  }}
                >
                  <IconTrash size={18} />
                </SidebarActionButton>
              </>
            )}
            

            <SidebarActionButton
              handleClick={() => {setIsOpen(!isOpen)}}
            >
              <IconChevronDown size={18} className={`${
                  isOpen ? 'rotate-180' : ''
                } transition-transform`} />
            </SidebarActionButton>
          </div>
        )}
      </div>
      <div
        onDrop={(e) => {dropHandler(e); setIsHover(false);}}
        onDragOver={allowDrop}
        onDragEnter={highlightDrop}
        onDragLeave={removeHighlight}
      >
        {isOpen && (
          <div className={`ml-4 gap-2 max-h-0 ${isHover ? 'max-h-10 mt-1' : ''}  overflow-hidden border-l-2 border-gray-700 pl-2 transition-all duration-200 delay-500`}>
            <button
              className="flex  text-[12.5px] flex-shrink-0 w-full cursor-pointer select-none items-center gap-3 rounded-md  p-2.5 text-white transition-all duration-200 hover:bg-gray-500/10"
              onClick={() => {
                handleNewConversation(currentFolder.id)
              // handleCreate();
              // handleSearch('');
              }}
              onMouseEnter={()=> setIsHover(true)}
              onMouseLeave={()=> setIsHover(false)}
            >
              <IconPlus size={16} />
              {t('New chat')}
            </button>
          </div>
          
        )}
        {isOpen ? folderComponent : null}
      </div>
    </div>
  );
};

export default Folder;

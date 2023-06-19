import React from 'react'
import { IconPlus } from '@tabler/icons-react';

interface NewChatProps {
    addTitle: string;
    handleCreate: () => void;
    handleSearch: (term: string) => void;
}


function NewChat({handleCreate, handleSearch, addTitle}: NewChatProps) {
  return (
    <button
        className="flex  flex-shrink-0 min-w-[190px] cursor-pointer select-none items-center gap-3 rounded-md border border-white/20 p-2.5 text-white transition-all duration-200 hover:bg-gray-500/10"
        onClick={() => {
        handleCreate();
        handleSearch('');
        }}
    >
        <IconPlus size={16} />
        {/* New Chat */}
        {addTitle}
    </button>
  )
}

export default NewChat

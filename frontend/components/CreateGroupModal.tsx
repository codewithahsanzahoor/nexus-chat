
import React, { useState } from 'react';
import { User } from '../types';

interface CreateGroupModalProps {
  friends: User[];
  onClose: () => void;
  onCreate: (name: string, members: string[]) => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ friends, onClose, onCreate }) => {
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const toggleMember = (id: string) => {
    setSelectedMembers(prev => 
      prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-background-dark border border-primary/20 rounded-xl shadow-2xl overflow-hidden glass-effect animate-in slide-in-from-bottom-4 duration-300">
        <div className="px-6 py-5 border-b border-primary/10 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Create New Group</h2>
            <p className="text-xs text-slate-400 mt-1">Chat with multiple friends at once</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-primary transition-colors">
            <span className="material-icons-round">close</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-xl bg-primary/10 border-2 border-dashed border-primary/40 flex items-center justify-center text-primary hover:bg-primary/20 transition-all cursor-pointer">
              <span className="material-icons-round text-2xl">add_a_photo</span>
            </div>
            <div className="flex-1 space-y-1.5">
              <label className="text-sm font-semibold text-slate-300">Group Name</label>
              <input 
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full bg-black/40 border border-primary/20 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                placeholder="e.g. Project Phoenix 🚀"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-300">Add Members</label>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded">
                {selectedMembers.length} Selected
              </span>
            </div>

            <div className="h-64 overflow-y-auto pr-2 space-y-2">
              {friends.map(friend => (
                <div 
                  key={friend._id}
                  onClick={() => toggleMember(friend._id)}
                  className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedMembers.includes(friend._id) 
                      ? 'border-primary/30 bg-primary/5' 
                      : 'border-transparent hover:bg-white/5'
                  }`}
                >
                  <img src={friend.avatar} alt={friend.name} className="w-10 h-10 rounded-lg object-cover" />
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-semibold text-white">{friend.name}</p>
                    <p className={`text-xs ${friend.status === 'online' ? 'text-primary' : 'text-slate-500'}`}>
                      {friend.status === 'online' ? 'Online' : 'Offline'}
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    selectedMembers.includes(friend._id) ? 'bg-primary border-primary text-white' : 'border-slate-700'
                  }`}>
                    {selectedMembers.includes(friend._id) && <span className="material-icons-round text-xs font-bold">check</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-5 bg-black/30 flex items-center justify-end space-x-3 border-t border-primary/10">
          <button onClick={onClose} className="px-5 py-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors">
            Cancel
          </button>
          <button 
            disabled={!groupName || selectedMembers.length === 0}
            onClick={() => onCreate(groupName, selectedMembers)}
            className="px-6 py-2 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg shadow-lg transition-all"
          >
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;

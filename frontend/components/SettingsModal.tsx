
import React, { useState } from 'react';
import { User } from '../types';

interface SettingsModalProps {
  user: User;
  onClose: () => void;
  onSave: (updatedUser: User) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ user, onClose, onSave }) => {
  const [name, setName] = useState(user.name);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...user, name });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg glass-effect border border-primary/30 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-primary/60 hover:text-primary transition-colors"
        >
          <span className="material-icons-round">close</span>
        </button>
        
        <div className="px-8 pt-8 pb-4 text-center">
          <h2 className="text-2xl font-bold text-white tracking-tight">User Settings</h2>
          <p className="text-primary/60 text-sm mt-1">Manage your profile and account preferences</p>
        </div>

        <div className="px-8 pb-8">
          <div className="flex flex-col items-center mb-10">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full p-1 border-2 border-primary/50 neon-glow overflow-hidden">
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover rounded-full" />
              </div>
              <button className="absolute bottom-1 right-1 bg-primary text-background-dark w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                <span className="material-icons-round text-sm">photo_camera</span>
              </button>
              <div className="absolute top-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-background-dark shadow-sm"></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-primary/80 uppercase tracking-widest ml-1">Display Name</label>
              <div className="relative">
                <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-primary/40">person</span>
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-primary/5 border border-primary/20 rounded-lg py-3 pl-12 pr-4 text-white placeholder-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
                  placeholder="Enter your name"
                />
              </div>
            </div>

            <div className="space-y-2 opacity-80">
              <label className="text-xs font-semibold text-primary/40 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-primary/20">alternate_email</span>
                <input 
                  className="w-full bg-transparent border border-primary/10 rounded-lg py-3 pl-12 pr-4 text-primary/40 cursor-not-allowed"
                  disabled
                  value="alex.rivers@stack.io"
                />
              </div>
              <p className="text-[10px] text-primary/30 px-1 italic">Email cannot be changed from profile settings.</p>
            </div>

            <div className="flex items-center justify-end gap-4 pt-4">
              <button 
                type="button" 
                onClick={onClose}
                className="px-6 py-2.5 rounded-lg border border-primary/30 text-primary/70 font-semibold text-sm hover:bg-primary/10 hover:text-primary transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-8 py-2.5 rounded-lg bg-primary text-background-dark font-bold text-sm shadow-[0_0_15px_rgba(13,185,242,0.4)] hover:shadow-[0_0_25px_rgba(13,185,242,0.6)] hover:brightness-110 transition-all"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>
      </div>
    </div>
  );
};

export default SettingsModal;

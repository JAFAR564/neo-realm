'use client';

import { Message } from './TerminalChat';
import PremiumBadge from '../PremiumBadge';
import EnergyReaction from './EnergyReaction';

type UserProfile = {
  id: string;
  username: string;
  avatar_url: string | null;
  character_class: string | null;
  subscription_tier?: string;
};

type MessageThreadProps = {
  messages: Message[];
  profile: { id: string };
  userProfiles: Record<string, UserProfile>;
  setReplyingTo: (id: number | null) => void;
  formatTime: (timestamp: string) => string;
  getMessageStyle: (type: string) => string;
  getUserDisplay: (message: Message) => string;
};

const MessageThread = ({ 
  messages, 
  profile, 
  userProfiles, 
  setReplyingTo, 
  formatTime, 
  getMessageStyle, 
  getUserDisplay 
}: MessageThreadProps) => {
  const renderMessage = (message: Message) => (
    <div key={message.id} className="mb-3">
      <div className="flex items-start">
        <span className={getMessageStyle(message.message_type)}>
          [{formatTime(message.created_at)}] {getUserDisplay(message)}:
          {userProfiles[message.user_id]?.subscription_tier === 'premium' && <PremiumBadge />}
        </span>
      </div>
      <div className={`ml-4 ${message.message_type === 'action' ? 'italic' : ''}`}>
        {message.content}
      </div>
      <button onClick={() => setReplyingTo(message.id)} className="text-xs text-gray-400 ml-4">Reply</button>
      {message.message_type === 'chat' && (
        <EnergyReaction 
          messageId={message.id} 
          userId={profile.id}
          reactions={message.reactions || []}
        />
      )}
      {message.replies && (
        <div className="ml-8 border-l-2 border-gray-600 pl-4">
          <MessageThread
            messages={message.replies}
            profile={profile}
            userProfiles={userProfiles}
            setReplyingTo={setReplyingTo}
            formatTime={formatTime}
            getMessageStyle={getMessageStyle}
            getUserDisplay={getUserDisplay}
          />
        </div>
      )}
    </div>
  );

  return <>{messages.map(renderMessage)}</>;
};

export default MessageThread;

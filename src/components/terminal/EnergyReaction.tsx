"use client";

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

type ReactionType = '⚡' | '</>' | '🤖' | '🔥' | '💧' | '🌿';

type Reaction = {
  id: number;
  user_id: string;
  message_id: number;
  reaction_type: ReactionType;
  created_at: string;
};

export default function EnergyReaction({ 
  messageId, 
  userId,
  reactions = []
}: { 
  messageId: number; 
  userId: string;
  reactions: Reaction[];
}) {
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [reactionCounts, setReactionCounts] = useState<Record<ReactionType, number>>({
    '⚡': 0,
    '</>': 0,
    '🤖': 0,
    '🔥': 0,
    '💧': 0,
    '🌿': 0
  });

  // Initialize reactions
  useState(() => {
    // Count existing reactions
    const counts: Record<ReactionType, number> = {
      '⚡': 0,
      '</>': 0,
      '🤖': 0,
      '🔥': 0,
      '💧': 0,
      '🌿': 0
    };
    
    reactions.forEach(reaction => {
      if (reaction.reaction_type in counts) {
        counts[reaction.reaction_type as ReactionType] += 1;
        // Check if this is the current user's reaction
        if (reaction.user_id === userId) {
          setUserReaction(reaction.reaction_type as ReactionType);
        }
      }
    });
    
    setReactionCounts(counts);
  });

  const toggleReaction = async (reactionType: ReactionType) => {
    try {
      // Check if user already reacted with this type
      const existingReaction = reactions.find(
        r => r.user_id === userId && r.reaction_type === reactionType
      );
      
      if (existingReaction) {
        // Remove reaction
        const { error } = await supabase
          .from('reactions')
          .delete()
          .eq('id', existingReaction.id);
        
        if (error) throw error;
        
        // Update local state
        setUserReaction(null);
        setReactionCounts(prev => ({
          ...prev,
          [reactionType]: prev[reactionType] - 1
        }));
      } else {
        // Add reaction
        const { data, error } = await supabase
          .from('reactions')
          .insert({
            user_id: userId,
            message_id: messageId,
            reaction_type: reactionType
          })
          .select()
          .single();
        
        if (error) throw error;
        
        // Update local state
        setUserReaction(reactionType);
        setReactionCounts(prev => ({
          ...prev,
          [reactionType]: prev[reactionType] + 1
        }));
      }
    } catch (error) {
      console.error('Error toggling reaction:', error);
    }
  };

  const reactionTypes: ReactionType[] = ['⚡', '</>', '🤖', '🔥', '💧', '🌿'];

  return (
    <div className="flex space-x-2 mt-1">
      {reactionTypes.map((reactionType) => (
        <button
          key={reactionType}
          onClick={() => toggleReaction(reactionType)}
          className={`px-2 py-1 rounded text-sm transition duration-200 ${
            userReaction === reactionType
              ? 'bg-cyan-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {reactionType} {reactionCounts[reactionType] > 0 ? reactionCounts[reactionType] : ''}
        </button>
      ))}
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

type Group = {
  id: string;
  name: string;
  description: string;
};

type Member = {
  id: string;
  username: string;
};

const GroupPage = ({ params }: { params: { id: string } }) => {
  const { user } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    const fetchGroup = async () => {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('id', params.id)
        .single();
      if (data) {
        setGroup(data);
      }
    };

    const fetchMembers = async () => {
      const { data, error } = await supabase
        .from('group_members')
        .select('profiles(id, username)')
        .eq('group_id', params.id);

      if (data) {
        const memberProfiles = data.map((m: { profiles: Member }) => m.profiles);
        setMembers(memberProfiles);
        if (user) {
          setIsMember(memberProfiles.some((m: Member) => m.id === user.id));
        }
      }
    };

    fetchGroup();
    fetchMembers();
  }, [params.id, user]);

  const handleJoin = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('group_members')
      .insert([{ group_id: params.id, user_id: user.id }]);

    if (!error) {
      setIsMember(true);
    }
  };

  if (!group) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{group.name}</h1>
      <p className="mb-4">{group.description}</p>

      {!isMember && (
        <button onClick={handleJoin} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded mb-4">
          Join Group
        </button>
      )}

      <h2 className="text-xl font-bold mb-2">Members</h2>
      <ul>
        {members.map((member) => (
          <li key={member.id}>{member.username}</li>
        ))}
      </ul>
    </div>
  );
};

export default GroupPage;

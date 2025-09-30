'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

type Group = {
  id: string;
  name: string;
  description: string;
};

const GroupsPage = () => {
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    const fetchGroups = async () => {
      const { data, error } = await supabase.from('groups').select('*');
      if (data) {
        setGroups(data);
      }
    };

    fetchGroups();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Groups</h1>
      <Link href="/groups/create" className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded mb-4 inline-block">
        Create Group
      </Link>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group) => (
          <div key={group.id} className="border border-gray-700 p-4 rounded">
            <h2 className="text-xl font-bold">{group.name}</h2>
            <p>{group.description}</p>
            <Link href={`/groups/${group.id}`} className="text-cyan-400 hover:underline mt-2 inline-block">
              View Group
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupsPage;

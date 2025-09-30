'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const CreateGroupPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('groups')
      .insert([{ name, description, creator_id: user.id }]);

    if (!error) {
      router.push('/groups');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Create Group</h1>
      <div className="flex flex-col gap-4 max-w-md">
        <input
          type="text"
          placeholder="Group Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-gray-800 text-white p-2 rounded"
        />
        <textarea
          placeholder="Group Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-gray-800 text-white p-2 rounded"
        />
        <button onClick={handleCreate} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded">
          Create
        </button>
      </div>
    </div>
  );
};

export default CreateGroupPage;

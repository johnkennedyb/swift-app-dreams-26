
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Contact {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  created_at: string;
}

export const useContacts = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchContacts();
    } else {
      setContacts([]);
      setLoading(false);
    }
  }, [user]);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('name');

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const addContact = async (name: string, phone: string) => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert([{ name, phone, user_id: user?.id }])
        .select()
        .single();

      if (error) throw error;
      
      setContacts(prev => [...prev, data]);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const deleteContact = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setContacts(prev => prev.filter(contact => contact.id !== id));
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  return { contacts, loading, addContact, deleteContact, refetch: fetchContacts };
};

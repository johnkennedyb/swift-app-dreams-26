
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Phone, User, Trash2 } from "lucide-react";
import { useContacts, Contact } from "@/hooks/useContacts";
import { useToast } from "@/hooks/use-toast";

interface ContactSelectorProps {
  onSelectContact: (contact: Contact) => void;
  selectedContact?: Contact | null;
}

const ContactSelector = ({ onSelectContact, selectedContact }: ContactSelectorProps) => {
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", phone: "" });
  const { contacts, loading, addContact, deleteContact } = useContacts();
  const { toast } = useToast();

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.phone) {
      toast({
        title: "Missing Information",
        description: "Please enter both name and phone number",
        variant: "destructive",
      });
      return;
    }

    const { error } = await addContact(newContact.name, newContact.phone);
    if (error) {
      toast({
        title: "Error",
        description: "Failed to add contact",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Contact added successfully",
      });
      setNewContact({ name: "", phone: "" });
      setIsAddingContact(false);
    }
  };

  const handleDeleteContact = async (id: string, name: string) => {
    const { error } = await deleteContact(id);
    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `${name} removed from contacts`,
      });
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading contacts...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Select Contact</h3>
        <Dialog open={isAddingContact} onOpenChange={setIsAddingContact}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-1" />
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Contact</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <Input
                  placeholder="Contact name"
                  value={newContact.name}
                  onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <Input
                  placeholder="+234 800 000 0000"
                  value={newContact.phone}
                  onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleAddContact} className="flex-1">
                  Add Contact
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddingContact(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {selectedContact && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-purple-900">{selectedContact.name}</p>
                <p className="text-sm text-purple-600">{selectedContact.phone}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onSelectContact(null as any)}
                className="text-purple-600"
              >
                Change
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!selectedContact && (
        <div className="grid gap-2 max-h-60 overflow-y-auto">
          {contacts.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Phone className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-600">No contacts yet</p>
                <p className="text-sm text-gray-500 mt-1">Add contacts to easily select them for support requests</p>
              </CardContent>
            </Card>
          ) : (
            contacts.map((contact) => (
              <Card key={contact.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div 
                      className="flex items-center space-x-3 flex-1"
                      onClick={() => onSelectContact(contact)}
                    >
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-sm text-gray-600">{contact.phone}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteContact(contact.id, contact.name)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ContactSelector;

import { useSeoMeta } from '@unhead/react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { AppSidebar } from '@/components/AppSidebar';
import { EditProfileForm } from '@/components/EditProfileForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user } = useCurrentUser();
  const navigate = useNavigate();

  useSeoMeta({
    title: 'Edit Profile - Doduo',
    description: 'Edit your Nostr profile information',
  });

  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <div className="h-screen flex bg-background">
      <AppSidebar />
      <div className="flex-1 overflow-auto">
        <div className="container max-w-2xl mx-auto py-8 px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Messages
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>
                Update your Nostr profile information. Changes will be published to the network.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EditProfileForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;


import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BuyerForm } from '@/components/BuyerForm';
import { BuyerFormData } from '@/lib/validations';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Buyer } from '@/lib/types';

export default function EditBuyer() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBuyer = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('buyers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Check if user owns this buyer
      if (user && data.owner_id !== user.id) {
        toast({
          title: 'Access Denied',
          description: 'You can only edit your own leads',
          variant: 'destructive',
        });
        navigate('/buyers');
        return;
      }

      setBuyer(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch buyer details',
        variant: 'destructive',
      });
      navigate('/buyers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: BuyerFormData) => {
    if (!buyer || !user) return;

    setIsSubmitting(true);
    try {
      // Create diff object for history
      const diff: Record<string, { old: any; new: any }> = {};
      
      Object.keys(formData).forEach((key) => {
        const oldValue = buyer[key as keyof Buyer];
        const newValue = formData[key as keyof BuyerFormData];
        
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          diff[key] = { old: oldValue, new: newValue };
        }
      });

      // Update the buyer
      const { error: buyerError } = await supabase
        .from('buyers')
        .update({
          ...formData,
          email: formData.email || null,
          budget_min: formData.budget_min || null,
          budget_max: formData.budget_max || null,
          notes: formData.notes || null,
          bhk: formData.bhk || null,
        })
        .eq('id', buyer.id);

      if (buyerError) throw buyerError;

      // Create history entry if there are changes
      if (Object.keys(diff).length > 0) {
        await supabase
          .from('buyer_history')
          .insert({
            buyer_id: buyer.id,
            changed_by: user.id,
            diff,
          });
      }

      toast({
        title: 'Success',
        description: 'Lead updated successfully!',
      });

      navigate(`/buyers/${buyer.id}`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update lead',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchBuyer();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!buyer) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Buyer not found</p>
        <Link to="/buyers">
          <Button className="mt-4">Back to Leads</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to={`/buyers/${buyer.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Details
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Lead</h1>
          <p className="text-muted-foreground">{buyer.full_name}</p>
        </div>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Edit Lead Information</CardTitle>
        </CardHeader>
        <CardContent>
          <BuyerForm
            buyer={buyer}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BuyerForm } from '@/components/BuyerForm';
import { BuyerFormData } from '@/lib/validations';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CreateBuyer() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (data: BuyerFormData) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Insert the buyer
      const { data: buyer, error: buyerError } = await supabase
        .from('buyers')
        .insert({
          ...data,
          email: data.email || null,
          budget_min: data.budget_min || null,
          budget_max: data.budget_max || null,
          notes: data.notes || null,
          bhk: data.bhk || null,
          owner_id: user.id,
        })
        .select()
        .single();

      if (buyerError) throw buyerError;

      // Create history entry
      await supabase
        .from('buyer_history')
        .insert({
          buyer_id: buyer.id,
          changed_by: user.id,
          diff: { created: { old: null, new: 'Lead created' } },
        });

      toast({
        title: 'Success',
        description: 'Lead created successfully!',
      });

      navigate('/buyers');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create lead',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Lead</CardTitle>
      </CardHeader>
      <CardContent>
        <BuyerForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </CardContent>
    </Card>
  );
}
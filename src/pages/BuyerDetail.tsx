import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Edit, Trash2, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Buyer, BuyerHistory } from '@/lib/types';

export default function BuyerDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [history, setHistory] = useState<BuyerHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBuyer = async () => {
    if (!id) return;

    try {
      const { data: buyerData, error: buyerError } = await supabase
        .from('buyers')
        .select('*')
        .eq('id', id)
        .single();

      if (buyerError) throw buyerError;
      setBuyer(buyerData);

      const { data: historyData, error: historyError } = await supabase
        .from('buyer_history')
        .select('*')
        .eq('buyer_id', id)
        .order('changed_at', { ascending: false })
        .limit(5);

      if (historyError) throw historyError;
      setHistory((historyData || []) as BuyerHistory[]);
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

  const handleDelete = async () => {
    if (!buyer || !user || buyer.owner_id !== user.id) return;

    if (!confirm('Are you sure you want to delete this lead? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('buyers')
        .delete()
        .eq('id', buyer.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Lead deleted successfully',
      });

      navigate('/buyers');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete lead',
        variant: 'destructive',
      });
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

  const canEdit = user && buyer.owner_id === user.id;
  const formatBudget = (min?: number | null, max?: number | null) => {
    if (!min && !max) return 'Not specified';
    if (min && max) return `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
    if (min) return `₹${min.toLocaleString()}+`;
    if (max) return `Up to ₹${max.toLocaleString()}`;
    return 'Not specified';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/buyers">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Leads
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{buyer.full_name}</h1>
            <p className="text-muted-foreground">Lead Details</p>
          </div>
        </div>
        {canEdit && (
          <div className="flex space-x-2">
            <Link to={`/buyers/${buyer.id}/edit`}>
              <Button>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                  <p className="text-lg">{buyer.full_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <p className="text-lg">{buyer.phone}</p>
                </div>
                {buyer.email && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-lg">{buyer.email}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">City</label>
                  <p className="text-lg">{buyer.city}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Property Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Property Type</label>
                  <p className="text-lg">{buyer.property_type}</p>
                </div>
                {buyer.bhk && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">BHK</label>
                    <p className="text-lg">{buyer.bhk} BHK</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Purpose</label>
                  <p className="text-lg">{buyer.purpose}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Timeline</label>
                  <p className="text-lg">{buyer.timeline}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Budget</label>
                <p className="text-lg">{formatBudget(buyer.budget_min, buyer.budget_max)}</p>
              </div>
            </CardContent>
          </Card>

          {buyer.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{buyer.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lead Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Current Status</label>
                <div className="mt-1">
                  <Badge variant={buyer.status === 'Converted' ? 'default' : 'secondary'}>
                    {buyer.status}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Source</label>
                <p>{buyer.source}</p>
              </div>
              <Separator />
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <p className="text-sm">{formatDate(buyer.created_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <p className="text-sm">{formatDate(buyer.updated_at)}</p>
              </div>
            </CardContent>
          </Card>

          {buyer.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {buyer.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Recent Changes</CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent changes</p>
              ) : (
                <div className="space-y-3">
                  {history.map((change) => (
                    <div key={change.id} className="text-sm">
                      <div className="font-medium">{formatDate(change.changed_at)}</div>
                      <div className="text-muted-foreground">
                        {Object.entries(change.diff).map(([field, values]) => (
                          <div key={field}>
                            {field}: {JSON.stringify(values.old)} → {JSON.stringify(values.new)}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
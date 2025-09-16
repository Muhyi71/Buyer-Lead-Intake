import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { BuyerFiltersComponent } from '@/components/BuyerFilters';
import { BuyerTable } from '@/components/BuyerTable';
import { Pagination } from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Upload, UserPlus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Buyer, BuyerFilters, PaginationInfo } from '@/lib/types';
import Papa from 'papaparse';

const PAGE_SIZE = 10;

export default function BuyerList() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: PAGE_SIZE,
    totalCount: 0,
    totalPages: 0,
  });

  
  const filters: BuyerFilters = useMemo(() => {
    const city = searchParams.get('city');
    const propertyType = searchParams.get('property_type');
    const status = searchParams.get('status');
    const timeline = searchParams.get('timeline');
    
    return {
      city: city as any || undefined,
      property_type: propertyType as any || undefined,
      status: status as any || undefined,
      timeline: timeline as any || undefined,
      search: searchParams.get('search') || undefined,
    };
  }, [searchParams]);

  const currentPage = parseInt(searchParams.get('page') || '1');

  const updateFilters = (newFilters: BuyerFilters) => {
    const params = new URLSearchParams();
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, value.toString());
      }
    });

   
    params.set('page', '1');
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({ page: '1' });
  };

  const onPageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
  };

  const fetchBuyers = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('buyers')
        .select('*', { count: 'exact' })
        .order('updated_at', { ascending: false });

      // Apply filters
      if (filters.city) {
        query = query.eq('city', filters.city);
      }
      if (filters.property_type) {
        query = query.eq('property_type', filters.property_type);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.timeline) {
        query = query.eq('timeline', filters.timeline);
      }
      if (filters.search) {
        query = query.or(
          `full_name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
        );
      }

      // Apply pagination
      const from = (currentPage - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      setBuyers(data || []);
      setPagination({
        page: currentPage,
        pageSize: PAGE_SIZE,
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / PAGE_SIZE),
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch leads',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToCsv = async () => {
    try {
      let query = supabase
        .from('buyers')
        .select('*')
        .order('updated_at', { ascending: false });

      // Apply current filters to export
      if (filters.city) query = query.eq('city', filters.city);
      if (filters.property_type) query = query.eq('property_type', filters.property_type);
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.timeline) query = query.eq('timeline', filters.timeline);
      if (filters.search) {
        query = query.or(
          `full_name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;

      const csvData = data.map(buyer => ({
        fullName: buyer.full_name,
        email: buyer.email || '',
        phone: buyer.phone,
        city: buyer.city,
        propertyType: buyer.property_type,
        bhk: buyer.bhk || '',
        purpose: buyer.purpose,
        budgetMin: buyer.budget_min || '',
        budgetMax: buyer.budget_max || '',
        timeline: buyer.timeline,
        source: buyer.source,
        notes: buyer.notes || '',
        tags: buyer.tags.join(','),
        status: buyer.status,
      }));

      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `buyer-leads-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Success',
        description: `Exported ${csvData.length} leads to CSV`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to export CSV',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchBuyers();
    }
  }, [user, filters, currentPage]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Buyer Leads</h1>
          <p className="text-muted-foreground">
            Manage and track your property buyer leads
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={exportToCsv} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Link to="/buyers/import">
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Import CSV
            </Button>
          </Link>
          <Link to="/buyers/new">
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              New Lead
            </Button>
          </Link>
        </div>
      </div>

      <BuyerFiltersComponent
        filters={filters}
        onFiltersChange={updateFilters}
        onClearFilters={clearFilters}
      />

      <Card>
        <CardHeader>
          <CardTitle>
            All Leads ({pagination.totalCount})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <BuyerTable buyers={buyers} currentUserId={user.id} />
              <Pagination pagination={pagination} onPageChange={onPageChange} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
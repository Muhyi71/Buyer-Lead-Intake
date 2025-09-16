import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Edit } from 'lucide-react';
import { Buyer } from '@/lib/types';

interface BuyerTableProps {
  buyers: Buyer[];
  currentUserId: string;
}

export function BuyerTable({ buyers, currentUserId }: BuyerTableProps) {
  const formatBudget = (min?: number | null, max?: number | null) => {
    if (!min && !max) return 'Not specified';
    if (min && max) return `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
    if (min) return `₹${min.toLocaleString()}+`;
    if (max) return `Up to ₹${max.toLocaleString()}`;
    return 'Not specified';
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'New': return 'default';
      case 'Qualified': return 'secondary';
      case 'Contacted': return 'outline';
      case 'Visited': return 'secondary';
      case 'Negotiation': return 'default';
      case 'Converted': return 'default';
      case 'Dropped': return 'destructive';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (buyers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No leads found. Try adjusting your filters or create a new lead.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Property Type</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Timeline</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {buyers.map((buyer) => (
            <TableRow key={buyer.id}>
              <TableCell className="font-medium">
                <div>
                  <div>{buyer.full_name}</div>
                  {buyer.email && (
                    <div className="text-sm text-muted-foreground">{buyer.email}</div>
                  )}
                </div>
              </TableCell>
              <TableCell>{buyer.phone}</TableCell>
              <TableCell>{buyer.city}</TableCell>
              <TableCell>
                <div>
                  <div>{buyer.property_type}</div>
                  {buyer.bhk && (
                    <div className="text-sm text-muted-foreground">{buyer.bhk} BHK</div>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-sm">
                {formatBudget(buyer.budget_min, buyer.budget_max)}
              </TableCell>
              <TableCell>{buyer.timeline}</TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(buyer.status) as any}>
                  {buyer.status}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(buyer.updated_at)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Link to={`/buyers/${buyer.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  {buyer.owner_id === currentUserId && (
                    <Link to={`/buyers/${buyer.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
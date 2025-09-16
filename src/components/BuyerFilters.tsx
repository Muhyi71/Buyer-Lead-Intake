import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BuyerFilters } from '@/lib/types';

interface BuyerFiltersProps {
  filters: BuyerFilters;
  onFiltersChange: (filters: BuyerFilters) => void;
  onClearFilters: () => void;
}

export function BuyerFiltersComponent({ filters, onFiltersChange, onClearFilters }: BuyerFiltersProps) {
  const updateFilter = (key: keyof BuyerFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value || undefined });
  };

  const hasActiveFilters = Object.values(filters).some(value => value && value !== '' && value !== 'all');

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={onClearFilters}>
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by name, phone, or email..."
            className="pl-10"
            value={filters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value)}
          />
        </div>

        <Select value={filters.city || 'all'} onValueChange={(value) => updateFilter('city', value === 'all' ? undefined : value)}>
          <SelectTrigger>
            <SelectValue placeholder="All Cities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            <SelectItem value="Hyderabad">Hyderabad</SelectItem>
            <SelectItem value="Mohali">Mohali</SelectItem>
            <SelectItem value="Delhi">Delhi</SelectItem>
            <SelectItem value="Chennai">Chennai</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.property_type || 'all'} onValueChange={(value) => updateFilter('property_type', value === 'all' ? undefined : value)}>
          <SelectTrigger>
            <SelectValue placeholder="All Property Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Property Types</SelectItem>
            <SelectItem value="Apartment">Apartment</SelectItem>
            <SelectItem value="Villa">Villa</SelectItem>
            <SelectItem value="Plot">Plot</SelectItem>
            <SelectItem value="Office">Office</SelectItem>
            <SelectItem value="Retail">Retail</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.status || 'all'} onValueChange={(value) => updateFilter('status', value === 'all' ? undefined : value)}>
          <SelectTrigger>
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="New">New</SelectItem>
            <SelectItem value="Qualified">Qualified</SelectItem>
            <SelectItem value="Contacted">Contacted</SelectItem>
            <SelectItem value="Visited">Visited</SelectItem>
            <SelectItem value="Negotiation">Negotiation</SelectItem>
            <SelectItem value="Converted">Converted</SelectItem>
            <SelectItem value="Dropped">Dropped</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.timeline || 'all'} onValueChange={(value) => updateFilter('timeline', value === 'all' ? undefined : value)}>
          <SelectTrigger>
            <SelectValue placeholder="All Timelines" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Timelines</SelectItem>
            <SelectItem value="0-3m">0-3 months</SelectItem>
            <SelectItem value="3-6m">3-6 months</SelectItem>
            <SelectItem value=">6m">6+ months</SelectItem>
            <SelectItem value="Exploring">Exploring</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
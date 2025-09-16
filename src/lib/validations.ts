import { z } from 'zod';


const baseBuyerSchema = z.object({
  full_name: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(80, 'Full name must not exceed 80 characters'),
  
  email: z.string()
    .email('Invalid email format')
    .optional()
    .or(z.literal('')),
  
  phone: z.string()
    .regex(/^[0-9]{10,15}$/, 'Phone must be 10-15 digits only'),
  
  city: z.enum(['Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other']),
  
  property_type: z.enum(['Apartment', 'Villa', 'Plot', 'Office', 'Retail']),
  
  bhk: z.enum(['1', '2', '3', '4', 'Studio']).optional(),
  
  purpose: z.enum(['Buy', 'Rent']),
  
  budget_min: z.number()
    .positive('Budget min must be positive')
    .optional()
    .or(z.literal(0).transform(() => undefined)),
  
  budget_max: z.number()
    .positive('Budget max must be positive')
    .optional()
    .or(z.literal(0).transform(() => undefined)),
  
  timeline: z.enum(['0-3m', '3-6m', '>6m', 'Exploring']),
  
  source: z.enum(['Website', 'Referral', 'Walk-in', 'Call', 'Other']),
  
  status: z.enum(['New', 'Qualified', 'Contacted', 'Visited', 'Negotiation', 'Converted', 'Dropped']).default('New'),
  
  notes: z.string()
    .max(1000, 'Notes must not exceed 1000 characters')
    .optional()
    .or(z.literal('')),
  
  tags: z.array(z.string()).default([]),
});

// Main buyer schema with refinements
export const buyerSchema = baseBuyerSchema
.refine((data) => {
  // BHK validation: required for Apartment and Villa
  if (['Apartment', 'Villa'].includes(data.property_type) && !data.bhk) {
    return false;
  }
  return true;
}, {
  message: 'BHK is required for Apartment and Villa properties',
  path: ['bhk']
})
.refine((data) => {
  
  if (data.budget_min && data.budget_max && data.budget_max < data.budget_min) {
    return false;
  }
  return true;
}, {
  message: 'Budget max must be greater than or equal to budget min',
  path: ['budget_max']
});

export type BuyerFormData = z.infer<typeof buyerSchema>;

export const csvRowSchema = baseBuyerSchema.extend({
  tags: z.string()
    .transform(val => val ? val.split(',').map(tag => tag.trim()).filter(Boolean) : [])
    .pipe(z.array(z.string())),
})
.refine((data) => {
  
  if (['Apartment', 'Villa'].includes(data.property_type) && !data.bhk) {
    return false;
  }
  return true;
}, {
  message: 'BHK is required for Apartment and Villa properties',
  path: ['bhk']
})
.refine((data) => {
  
  if (data.budget_min && data.budget_max && data.budget_max < data.budget_min) {
    return false;
  }
  return true;
}, {
  message: 'Budget max must be greater than or equal to budget min',
  path: ['budget_max']
});

export type CsvRowData = z.infer<typeof csvRowSchema>;
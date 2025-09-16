import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Upload, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { csvRowSchema, CsvRowData } from '@/lib/validations';
import Papa from 'papaparse';

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface ParsedRow {
  data: CsvRowData;
  errors: ValidationError[];
  isValid: boolean;
}

export default function ImportBuyers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<{ success: number; errors: number } | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setParsedData([]);
      setImportResults(null);
    } else {
      toast({
        title: 'Invalid File',
        description: 'Please select a CSV file',
        variant: 'destructive',
      });
    }
  };

  const parseFile = async () => {
    if (!file) return;

    setParsing(true);
    try {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const parsed: ParsedRow[] = results.data.map((row: any, index: number) => {
            const errors: ValidationError[] = [];
            
            try {
              // Transform the CSV row to match our schema
              const transformedRow = {
                full_name: row.fullName || '',
                email: row.email || '',
                phone: row.phone || '',
                city: row.city || '',
                property_type: row.propertyType || '',
                bhk: row.bhk || undefined,
                purpose: row.purpose || '',
                budget_min: row.budgetMin ? parseInt(row.budgetMin) : undefined,
                budget_max: row.budgetMax ? parseInt(row.budgetMax) : undefined,
                timeline: row.timeline || '',
                source: row.source || '',
                notes: row.notes || '',
                tags: row.tags || '',
                status: row.status || 'New',
              };

              const validationResult = csvRowSchema.safeParse(transformedRow);
              
              if (validationResult.success) {
                return {
                  data: validationResult.data,
                  errors: [],
                  isValid: true,
                };
              } else {
                validationResult.error.issues.forEach(issue => {
                  errors.push({
                    row: index + 2, // +2 for header and 0-based index
                    field: issue.path[0] as string,
                    message: issue.message,
                  });
                });
              }
            } catch (error: any) {
              errors.push({
                row: index + 2,
                field: 'general',
                message: error.message || 'Invalid data format',
              });
            }

            return {
              data: row as CsvRowData,
              errors,
              isValid: false,
            };
          });

          if (parsed.length > 200) {
            toast({
              title: 'File Too Large',
              description: 'Maximum 200 rows allowed per import',
              variant: 'destructive',
            });
            setParsedData([]);
          } else {
            setParsedData(parsed);
          }
        },
        error: (error) => {
          toast({
            title: 'Parse Error',
            description: 'Failed to parse CSV file: ' + error.message,
            variant: 'destructive',
          });
        },
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to read file',
        variant: 'destructive',
      });
    } finally {
      setParsing(false);
    }
  };

  const importValidRows = async () => {
    if (!user) return;

    const validRows = parsedData.filter(row => row.isValid);
    if (validRows.length === 0) {
      toast({
        title: 'No Valid Data',
        description: 'No valid rows to import',
        variant: 'destructive',
      });
      return;
    }

    setImporting(true);
    try {
      const rowsToInsert = validRows.map(row => ({
        ...row.data,
        email: row.data.email || null,
        budget_min: row.data.budget_min || null,
        budget_max: row.data.budget_max || null,
        notes: row.data.notes || null,
        bhk: row.data.bhk || null,
        owner_id: user.id,
      }));

      const { data, error } = await supabase
        .from('buyers')
        .insert(rowsToInsert)
        .select();

      if (error) throw error;

      // Create history entries for imported leads
      if (data) {
        const historyEntries = data.map(buyer => ({
          buyer_id: buyer.id,
          changed_by: user.id,
          diff: { imported: { old: null, new: 'Lead imported from CSV' } },
        }));

        await supabase
          .from('buyer_history')
          .insert(historyEntries);
      }

      setImportResults({
        success: validRows.length,
        errors: parsedData.length - validRows.length,
      });

      toast({
        title: 'Import Complete',
        description: `Successfully imported ${validRows.length} leads`,
      });

      // Clear the form
      setFile(null);
      setParsedData([]);
      
      // Reset file input
      const fileInput = document.getElementById('csv-file') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }

    } catch (error: any) {
      toast({
        title: 'Import Failed',
        description: error.message || 'Failed to import leads',
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  const validRowsCount = parsedData.filter(row => row.isValid).length;
  const invalidRowsCount = parsedData.length - validRowsCount;
  const allErrors = parsedData.flatMap(row => row.errors);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/buyers">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Leads
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Import Leads</h1>
          <p className="text-muted-foreground">Import leads from CSV file (max 200 rows)</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>CSV Format</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Your CSV file should have the following headers (exactly as shown):
          </p>
          <div className="bg-muted p-3 rounded-md text-sm font-mono">
            fullName,email,phone,city,propertyType,bhk,purpose,budgetMin,budgetMax,timeline,source,notes,tags,status
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upload CSV File</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            id="csv-file"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
          />
          
          {file && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </div>
              <Button onClick={parseFile} disabled={parsing}>
                {parsing ? 'Parsing...' : 'Parse File'}
                <Upload className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {parsedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Validation Results</span>
              <div className="flex space-x-2">
                <Badge variant="default">{validRowsCount} Valid</Badge>
                {invalidRowsCount > 0 && (
                  <Badge variant="destructive">{invalidRowsCount} Invalid</Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {allErrors.length > 0 && (
              <Alert>
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">Validation Errors:</p>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {allErrors.map((error, index) => (
                        <div key={index} className="text-sm">
                          <span className="font-medium">Row {error.row}:</span>{' '}
                          <span className="text-muted-foreground">{error.field}</span> - {error.message}
                        </div>
                      ))}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {validRowsCount > 0 && (
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {validRowsCount} valid rows ready for import
                </p>
                <Button onClick={importValidRows} disabled={importing}>
                  {importing ? 'Importing...' : `Import ${validRowsCount} Leads`}
                </Button>
              </div>
            )}

            <div className="rounded-md border max-h-96 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Row</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Property Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.slice(0, 20).map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 2}</TableCell>
                      <TableCell>
                        <Badge variant={row.isValid ? 'default' : 'destructive'}>
                          {row.isValid ? 'Valid' : 'Invalid'}
                        </Badge>
                      </TableCell>
                      <TableCell>{row.data.full_name}</TableCell>
                      <TableCell>{row.data.phone}</TableCell>
                      <TableCell>{row.data.city}</TableCell>
                      <TableCell>{row.data.property_type}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {parsedData.length > 20 && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Showing first 20 rows of {parsedData.length} total rows
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {importResults && (
        <Card>
          <CardHeader>
            <CardTitle>Import Complete</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Successfully imported:</span>
                <Badge variant="default">{importResults.success} leads</Badge>
              </div>
              {importResults.errors > 0 && (
                <div className="flex items-center justify-between">
                  <span>Skipped (invalid):</span>
                  <Badge variant="destructive">{importResults.errors} rows</Badge>
                </div>
              )}
            </div>
            <div className="mt-4">
              <Link to="/buyers">
                <Button>View Imported Leads</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
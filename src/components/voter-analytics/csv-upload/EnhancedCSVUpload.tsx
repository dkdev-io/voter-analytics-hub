/**
 * Enhanced CSV Upload Component with Flexible Mapping
 * Supports auto-detection, manual mapping, and profile management
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Loader2, Upload, Download, Save, FileText, CheckCircle, AlertTriangle, X, Info } from 'lucide-react';
import { toast } from 'sonner';

import { analyzeCSVData, saveMappingProfile, getMappingProfiles, deleteMappingProfile, createDynamicFieldDefinitions } from '@/utils/flexibleCsvMapping';
import { transformCSVData, validateAndEnhanceDataEnhanced, uploadDataBatches } from '@/utils/csvDataProcessing';
import { 
  CSVPreviewData, 
  MappingProfile, 
  ColumnMapping, 
  FlexibleMappingConfig, 
  FieldDefinition,
  ProcessingResult,
  CORE_FIELD_DEFINITIONS,
  DEFAULT_MAPPING_CONFIG 
} from '@/types/csvMapping';

interface EnhancedCSVUploadProps {
  onUploadComplete?: (result: { success: boolean; rowsUploaded: number; warnings: any[] }) => void;
  onCancel?: () => void;
}

type UploadStep = 'file-select' | 'preview' | 'mapping' | 'validation' | 'upload' | 'complete';

export function EnhancedCSVUpload({ onUploadComplete, onCancel }: EnhancedCSVUploadProps) {
  // State management
  const [step, setStep] = useState<UploadStep>('file-select');
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCSVData] = useState<string[][] | null>(null);
  const [previewData, setPreviewData] = useState<CSVPreviewData | null>(null);
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
  const [config, setConfig] = useState<FlexibleMappingConfig>(DEFAULT_MAPPING_CONFIG);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Profile management
  const [profiles, setProfiles] = useState<MappingProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string>('');
  const [showSaveProfile, setShowSaveProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileDescription, setNewProfileDescription] = useState('');
  
  // Field definitions (core + dynamic)
  const [fieldDefinitions, setFieldDefinitions] = useState<FieldDefinition[]>(CORE_FIELD_DEFINITIONS);

  // Load profiles on component mount
  useEffect(() => {
    setProfiles(getMappingProfiles());
  }, []);

  // File handling
  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'text/csv') {
      toast.error('Please select a CSV file');
      return;
    }

    setFile(selectedFile);
    setIsProcessing(true);

    try {
      const text = await selectedFile.text();
      const rows = text.trim().split('\n').map(row => {
        // Simple CSV parsing - handle quoted fields
        const result: string[] = [];
        let currentField = '';
        let inQuotes = false;
        
        for (let i = 0; i < row.length; i++) {
          const char = row[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(currentField.trim());
            currentField = '';
          } else {
            currentField += char;
          }
        }
        result.push(currentField.trim());
        return result;
      });

      if (rows.length < 2) {
        toast.error('CSV file must have at least a header row and one data row');
        return;
      }

      const headers = rows[0];
      const dataRows = rows.slice(1);
      
      setCSVData([headers, ...dataRows]);
      
      // Analyze the CSV data
      const analysis = analyzeCSVData(headers, dataRows);
      setPreviewData(analysis);
      
      // Create dynamic field definitions
      const dynamicFields = createDynamicFieldDefinitions(analysis.columnAnalysis, fieldDefinitions);
      setFieldDefinitions(dynamicFields);
      
      // Initialize mapping from suggestions
      const initialMapping: Record<string, string> = {};
      analysis.suggestedMappings.forEach(mapping => {
        initialMapping[mapping.csvColumn] = mapping.dbField;
      });
      setFieldMapping(initialMapping);
      
      setStep('preview');
    } catch (error) {
      console.error('Error processing CSV:', error);
      toast.error('Error processing CSV file. Please check the file format.');
    } finally {
      setIsProcessing(false);
    }
  }, [fieldDefinitions]);

  // Profile management
  const applyProfile = useCallback((profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (profile && previewData) {
      const newMapping: Record<string, string> = {};
      
      // Apply profile mapping to available columns
      Object.entries(profile.mapping).forEach(([csvColumn, dbField]) => {
        if (previewData.headers.includes(csvColumn)) {
          newMapping[csvColumn] = dbField;
        }
      });
      
      setFieldMapping(newMapping);
      setSelectedProfile(profileId);
      toast.success(`Applied profile: ${profile.name}`);
    }
  }, [profiles, previewData]);

  const saveProfile = useCallback(() => {
    if (!newProfileName.trim() || !previewData) return;
    
    try {
      const profileId = saveMappingProfile({
        name: newProfileName.trim(),
        description: newProfileDescription.trim(),
        mapping: fieldMapping,
        fieldDefinitions: fieldDefinitions
      });
      
      setProfiles(getMappingProfiles());
      setNewProfileName('');
      setNewProfileDescription('');
      setShowSaveProfile(false);
      toast.success('Mapping profile saved successfully');
    } catch (error) {
      toast.error('Error saving profile');
    }
  }, [newProfileName, newProfileDescription, fieldMapping, fieldDefinitions, previewData]);

  const removeProfile = useCallback((profileId: string) => {
    try {
      deleteMappingProfile(profileId);
      setProfiles(getMappingProfiles());
      if (selectedProfile === profileId) {
        setSelectedProfile('');
      }
      toast.success('Profile deleted');
    } catch (error) {
      toast.error('Error deleting profile');
    }
  }, [selectedProfile]);

  // Mapping management
  const updateMapping = useCallback((csvColumn: string, dbField: string) => {
    setFieldMapping(prev => {
      const newMapping = { ...prev };
      if (dbField === 'unmapped') {
        delete newMapping[csvColumn];
      } else {
        newMapping[csvColumn] = dbField;
      }
      return newMapping;
    });
  }, []);

  // Validation and processing
  const validateMapping = useCallback(() => {
    if (!previewData || !csvData) return;
    
    setIsProcessing(true);
    
    try {
      // Create header mapping for transformation
      const headerMapping: Record<number, string> = {};
      Object.entries(fieldMapping).forEach(([csvColumn, dbField]) => {
        const columnIndex = previewData.headers.indexOf(csvColumn);
        if (columnIndex !== -1) {
          headerMapping[columnIndex] = dbField;
        }
      });
      
      // Transform the data
      const transformedData = transformCSVData(
        csvData.slice(1), // Skip header row
        headerMapping,
        previewData.columnAnalysis,
        fieldDefinitions
      );
      
      // Validate the transformed data
      const result = validateAndEnhanceDataEnhanced(transformedData, fieldDefinitions);
      setProcessingResult(result);
      setStep('validation');
    } catch (error) {
      console.error('Error validating data:', error);
      toast.error('Error validating data. Please check your mappings.');
    } finally {
      setIsProcessing(false);
    }
  }, [previewData, csvData, fieldMapping, fieldDefinitions]);

  const uploadData = useCallback(async () => {
    if (!processingResult) return;
    
    setStep('upload');
    setUploadProgress(0);
    
    try {
      await uploadDataBatches(
        processingResult.validRows,
        setUploadProgress
      );
      
      setStep('complete');
      onUploadComplete?.({
        success: true,
        rowsUploaded: processingResult.validRows.length,
        warnings: processingResult.warnings
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed. Please try again.');
      setStep('validation');
    }
  }, [processingResult, onUploadComplete]);

  // Reset function
  const reset = useCallback(() => {
    setStep('file-select');
    setFile(null);
    setCSVData(null);
    setPreviewData(null);
    setFieldMapping({});
    setProcessingResult(null);
    setUploadProgress(0);
    setSelectedProfile('');
  }, []);

  // Render functions
  const renderFileSelect = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload size={20} />
          Select CSV File
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
          <Input
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            disabled={isProcessing}
            className="hidden"
            id="csv-upload"
          />
          <label 
            htmlFor="csv-upload" 
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            {isProcessing ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <FileText className="h-8 w-8 text-gray-400" />
            )}
            <span className="text-sm text-gray-600">
              {isProcessing ? 'Processing...' : 'Click to select CSV file'}
            </span>
          </label>
        </div>
        
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Upload any CSV file with voter contact data. The system will automatically detect column types and suggest field mappings.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );

  const renderPreview = () => {
    if (!previewData) return null;
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>CSV Preview & Analysis</span>
              <Badge variant="secondary">
                {previewData.totalRows} rows
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="preview">
              <TabsList>
                <TabsTrigger value="preview">Data Preview</TabsTrigger>
                <TabsTrigger value="analysis">Column Analysis</TabsTrigger>
                <TabsTrigger value="suggestions">Suggested Mappings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="preview" className="mt-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {previewData.headers.map((header, index) => (
                          <TableHead key={index} className="whitespace-nowrap">
                            {header}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.rows.slice(0, 5).map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <TableCell key={cellIndex} className="whitespace-nowrap">
                              {cell || <span className="text-gray-400">empty</span>}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="analysis" className="mt-4">
                <div className="space-y-4">
                  {Object.entries(previewData.columnAnalysis).map(([column, analysis]) => (
                    <div key={column} className="border rounded p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{column}</h4>
                        <Badge variant={analysis.confidence > 0.8 ? 'default' : 'secondary'}>
                          {analysis.type} ({Math.round(analysis.confidence * 100)}%)
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Unique values: {analysis.uniqueValues}</p>
                        <p>Null count: {analysis.nullCount}</p>
                        <p>Sample: {analysis.sampleValues.slice(0, 3).join(', ')}</p>
                        {analysis.dateFormats && analysis.dateFormats.length > 0 && (
                          <p>Date formats: {analysis.dateFormats.join(', ')}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="suggestions" className="mt-4">
                <div className="space-y-2">
                  {previewData.suggestedMappings.map((mapping, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <span className="font-medium">{mapping.csvColumn}</span>
                      <span className="text-gray-600">→</span>
                      <span className="text-blue-600">{mapping.dbField}</span>
                      <Badge variant={mapping.confidence > 0.8 ? 'default' : 'secondary'}>
                        {Math.round(mapping.confidence * 100)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={reset}>
            Start Over
          </Button>
          <Button onClick={() => setStep('mapping')}>
            Configure Mapping
          </Button>
        </div>
      </div>
    );
  };

  const renderMapping = () => {
    if (!previewData) return null;
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Configure Field Mapping</span>
              <div className="flex gap-2">
                <Dialog open={showSaveProfile} onOpenChange={setShowSaveProfile}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Save size={16} className="mr-1" />
                      Save Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Save Mapping Profile</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="profile-name">Profile Name</Label>
                        <Input
                          id="profile-name"
                          value={newProfileName}
                          onChange={(e) => setNewProfileName(e.target.value)}
                          placeholder="e.g., Campaign Data Format"
                        />
                      </div>
                      <div>
                        <Label htmlFor="profile-description">Description (Optional)</Label>
                        <Textarea
                          id="profile-description"
                          value={newProfileDescription}
                          onChange={(e) => setNewProfileDescription(e.target.value)}
                          placeholder="Description of this mapping configuration..."
                          rows={3}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowSaveProfile(false)}>
                          Cancel
                        </Button>
                        <Button onClick={saveProfile} disabled={!newProfileName.trim()}>
                          Save Profile
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Selection */}
            {profiles.length > 0 && (
              <div className="space-y-2">
                <Label>Load Existing Profile</Label>
                <div className="flex gap-2">
                  <Select value={selectedProfile} onValueChange={applyProfile}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a saved profile..." />
                    </SelectTrigger>
                    <SelectContent>
                      {profiles.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.name}
                          {profile.description && (
                            <span className="text-gray-500 text-xs ml-2">
                              - {profile.description}
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedProfile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeProfile(selectedProfile)}
                    >
                      <X size={16} />
                    </Button>
                  )}
                </div>
              </div>
            )}
            
            {/* Mapping Table */}
            <div className="space-y-2">
              <Label>Field Mappings</Label>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>CSV Column</TableHead>
                      <TableHead>Detected Type</TableHead>
                      <TableHead>Map to Field</TableHead>
                      <TableHead>Required</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.headers.map((header, index) => {
                      const analysis = previewData.columnAnalysis[header];
                      const mappedField = fieldMapping[header];
                      const fieldDef = fieldDefinitions.find(f => f.key === mappedField);
                      
                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{header}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {analysis.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Select 
                              value={mappedField || 'unmapped'} 
                              onValueChange={(value) => updateMapping(header, value)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="unmapped">Don't map</SelectItem>
                                {fieldDefinitions.map((field) => (
                                  <SelectItem key={field.key} value={field.key}>
                                    <div>
                                      <div>{field.label}</div>
                                      {field.description && (
                                        <div className="text-xs text-gray-500">
                                          {field.description}
                                        </div>
                                      )}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            {fieldDef?.required && (
                              <Badge variant="destructive" className="text-xs">
                                Required
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep('preview')}>
            Back to Preview
          </Button>
          <Button onClick={validateMapping} disabled={Object.keys(fieldMapping).length === 0}>
            Validate Mapping
          </Button>
        </div>
      </div>
    );
  };

  const renderValidation = () => {
    if (!processingResult) return null;
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle size={20} className="text-green-600" />
              Validation Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {processingResult.stats.validRows}
                </div>
                <div className="text-sm text-green-700">Valid Rows</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {processingResult.stats.invalidRows}
                </div>
                <div className="text-sm text-red-700">Invalid Rows</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {processingResult.warnings.length}
                </div>
                <div className="text-sm text-yellow-700">Warnings</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {processingResult.stats.totalRows}
                </div>
                <div className="text-sm text-blue-700">Total Rows</div>
              </div>
            </div>
            
            {processingResult.warnings.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Found {processingResult.warnings.length} warnings. Data will be uploaded with corrections applied.
                </AlertDescription>
              </Alert>
            )}
            
            {processingResult.stats.invalidRows > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {processingResult.stats.invalidRows} rows have validation errors and will not be uploaded.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
        
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep('mapping')}>
            Back to Mapping
          </Button>
          <Button 
            onClick={uploadData} 
            disabled={processingResult.stats.validRows === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            Upload {processingResult.stats.validRows} Valid Rows
          </Button>
        </div>
      </div>
    );
  };

  const renderUpload = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload size={20} />
          Uploading Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={uploadProgress} className="w-full" />
        <p className="text-center text-sm text-gray-600">
          Uploading... {uploadProgress}% complete
        </p>
      </CardContent>
    </Card>
  );

  const renderComplete = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-600">
          <CheckCircle size={20} />
          Upload Complete
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <p>Successfully uploaded {processingResult?.stats.validRows} rows!</p>
        {processingResult?.warnings && processingResult.warnings.length > 0 && (
          <p className="text-sm text-yellow-600">
            {processingResult.warnings.length} warnings were handled automatically.
          </p>
        )}
        <div className="flex justify-center gap-2 mt-4">
          <Button onClick={reset}>
            Upload Another File
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Close
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Main render
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Step indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          {[
            { key: 'file-select', label: 'Select File' },
            { key: 'preview', label: 'Preview' },
            { key: 'mapping', label: 'Mapping' },
            { key: 'validation', label: 'Validation' },
            { key: 'upload', label: 'Upload' },
            { key: 'complete', label: 'Complete' }
          ].map((stepInfo, index) => {
            const isActive = step === stepInfo.key;
            const isCompleted = ['file-select', 'preview', 'mapping', 'validation', 'upload'].indexOf(stepInfo.key) < 
                              ['file-select', 'preview', 'mapping', 'validation', 'upload', 'complete'].indexOf(step);
            
            return (
              <div key={stepInfo.key} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${isActive ? 'bg-blue-600 text-white' : 
                    isCompleted ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}
                `}>
                  {isCompleted ? <CheckCircle size={16} /> : index + 1}
                </div>
                <span className={`ml-2 text-sm ${
                  isActive ? 'text-blue-600 font-medium' : 
                  isCompleted ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {stepInfo.label}
                </span>
                {index < 5 && (
                  <div className={`w-8 h-px mx-4 ${
                    isCompleted ? 'bg-green-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      {step === 'file-select' && renderFileSelect()}
      {step === 'preview' && renderPreview()}
      {step === 'mapping' && renderMapping()}
      {step === 'validation' && renderValidation()}
      {step === 'upload' && renderUpload()}
      {step === 'complete' && renderComplete()}
    </div>
  );
}
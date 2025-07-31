// src/components/DeploymentForm/steps/Step6FileUpload.tsx
'use client';

import { Upload, Check, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useFormContext } from '../FormProvider';
import { UploadedFile } from '@/types/form';

export default function Step6FileUpload() {
  const { state, updateObjectField } = useFormContext();
  const { data } = state;

  const [uploadedFiles, setUploadedFiles] = useState<{
    sqlQueries?: UploadedFile;
    modelPickle?: UploadedFile;
    config?: UploadedFile;
    notebook?: UploadedFile;
  }>(data.uploadedFiles || {});

  // No automatic syncing - only sync when user navigates
  // The form will be synced when nextStep is called

  const handleFileUpload = (fileType: string, file: File) => {
    setUploadedFiles(prev => ({
      ...prev,
      [fileType]: {
        name: file.name,
        size: file.size,
        type: file.type
      }
    }));
  };

  const FileUploadZone = ({ 
    fileType, 
    accept, 
    label, 
    description 
  }: { 
    fileType: string; 
    accept: string; 
    label: string; 
    description: string;
  }) => (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
      <Upload className="mx-auto mb-4 text-gray-400" size={32} />
      <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
      <p className="text-xs text-gray-500 mb-4">{description}</p>
      <input
        type="file"
        accept={accept}
        onChange={(e) => e.target.files?.[0] && handleFileUpload(fileType, e.target.files[0])}
        className="hidden"
        id={fileType}
      />
      <label
        htmlFor={fileType}
        className="cursor-pointer bg-blue-50 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-100 transition-colors"
      >
        Choose File
      </label>
      {uploadedFiles[fileType as keyof typeof uploadedFiles] && (
        <div className="mt-2 text-sm text-green-600 flex items-center justify-center">
          <Check size={16} className="mr-1" />
          {uploadedFiles[fileType as keyof typeof uploadedFiles]?.name}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Upload className="text-yellow-600" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">File Uploads</h2>
        <p className="text-gray-600">Upload your model files and documentation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FileUploadZone
          fileType="sqlQueries"
          accept=".ipynb,.sql,.py"
          label="SQL Queries File"
          description="Notebook or script with data preparation queries"
        />

        <FileUploadZone
          fileType="modelPickle"
          accept=".pkl,.pickle"
          label="Model Pickle File"
          description="Trained model in pickle format"
        />

        <FileUploadZone
          fileType="config"
          accept=".yaml,.yml,.json"
          label="Configuration File"
          description="Model configuration and hyperparameters"
        />

        <FileUploadZone
          fileType="notebook"
          accept=".ipynb"
          label="Training Notebook"
          description="Jupyter notebook with training process"
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="text-blue-600 mr-2 mt-0.5" size={16} />
          <div>
            <h4 className="font-medium text-blue-800">File Upload Notes</h4>
            <p className="text-sm text-blue-700 mt-1">
              All files are optional but help with deployment validation. Model pickle file is recommended for automatic testing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
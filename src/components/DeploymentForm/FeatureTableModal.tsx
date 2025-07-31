// src/components/DeploymentForm/FeatureTableModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Upload, Download, ArrowUp, ArrowDown } from 'lucide-react';
import { Feature, PreprocessingStep } from '@/types/form';

interface FeatureTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  features: Feature[];
  onSave: (features: Feature[]) => void;
}

const COMMON_PREPROCESSING_STEPS = [
  'Cap & Floor',
  'Impute Nulls', 
  'Binning',
  'Weight of Evidence Encoding',
  'Standardization',
  'Normalization',
  'Log Transform',
  'Outlier Removal',
  'One-Hot Encoding',
  'Label Encoding'
];

export default function FeatureTableModal({ isOpen, onClose, features, onSave }: FeatureTableModalProps) {
  const [localFeatures, setLocalFeatures] = useState<Feature[]>(features);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    setLocalFeatures(features);
  }, [features]);

  if (!isOpen) return null;

  const addFeature = () => {
    const newFeature: Feature = {
      id: Date.now().toString(),
      order: localFeatures.length + 1,
      name: '',
      type: 'numerical',
      transformation: '',
      description: '',
      step1: { name: '', value: '' },
      step2: { name: '', value: '' },
      step3: { name: '', value: '' },
      step4: { name: '', value: '' }
    };
    setLocalFeatures(prev => [...prev, newFeature]);
  };

  const removeFeature = (id: string) => {
    setLocalFeatures(prev => {
      const filtered = prev.filter(f => f.id !== id);
      // Reorder remaining features
      return filtered.map((f, index) => ({ ...f, order: index + 1 }));
    });
  };

  const updateFeature = (id: string, field: string, value: any) => {
    setLocalFeatures(prev => prev.map(feature => {
      if (feature.id === id) {
        if (field.includes('.')) {
          const [stepKey, stepField] = field.split('.');
          const currentStep = feature[stepKey as keyof Feature] as PreprocessingStep || { name: '', value: '' };
          return {
            ...feature,
            [stepKey]: {
              ...currentStep,
              [stepField]: value
            }
          };
        }
        return { ...feature, [field]: value };
      }
      return feature;
    }));
  };

  const moveFeature = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= localFeatures.length) return;
    
    const newFeatures = [...localFeatures];
    const [movedFeature] = newFeatures.splice(fromIndex, 1);
    newFeatures.splice(toIndex, 0, movedFeature);
    
    // Update order numbers
    const reorderedFeatures = newFeatures.map((f, index) => ({ ...f, order: index + 1 }));
    setLocalFeatures(reorderedFeatures);
  };

  const handleSave = () => {
    onSave(localFeatures);
    onClose();
  };

  const exportToCSV = () => {
    const headers = ['Order', 'Feature Name', 'Type', 'Description', 'Step 1 Name', 'Step 1 Value', 'Step 2 Name', 'Step 2 Value', 'Step 3 Name', 'Step 3 Value', 'Step 4 Name', 'Step 4 Value'];
    
    const csvContent = [
      headers.join(','),
      ...localFeatures.map(f => [
        f.order,
        f.name,
        f.type,
        f.description,
        f.step1?.name || '',
        f.step1?.value || '',
        f.step2?.name || '',
        f.step2?.value || '',
        f.step3?.name || '',
        f.step3?.value || '',
        f.step4?.name || '',
        f.step4?.value || ''
      ].map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'features_preprocessing.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCSVImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split('\n');
      const headers = lines[0].split(',');
      
      const importedFeatures: Feature[] = lines.slice(1)
        .filter(line => line.trim())
        .map((line, index) => {
          const values = line.split(',').map(v => v.replace(/"/g, ''));
          return {
            id: Date.now().toString() + index,
            order: parseInt(values[0]) || index + 1,
            name: values[1] || '',
            type: (values[2] as Feature['type']) || 'numerical',
            transformation: '',
            description: values[3] || '',
            step1: { name: values[4] || '', value: values[5] || '' },
            step2: { name: values[6] || '', value: values[7] || '' },
            step3: { name: values[8] || '', value: values[9] || '' },
            step4: { name: values[10] || '', value: values[11] || '' }
          };
        });
      
      setLocalFeatures(importedFeatures);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Features & Preprocessing Configuration</h2>
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVImport}
              className="hidden"
              id="csv-import"
            />
            <label
              htmlFor="csv-import"
              className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors cursor-pointer flex items-center gap-2 text-sm"
            >
              <Upload size={16} />
              Import CSV
            </label>
            <button
              onClick={exportToCSV}
              className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
            >
              <Download size={16} />
              Export CSV
            </button>
            <button
              onClick={addFeature}
              className="bg-indigo-600 text-white px-3 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm"
            >
              <Plus size={16} />
              Add Feature
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="flex-1 overflow-auto p-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-300 px-2 py-3 text-left font-medium">Actions</th>
                  <th className="border border-gray-300 px-2 py-3 text-left font-medium">Order</th>
                  <th className="border border-gray-300 px-2 py-3 text-left font-medium min-w-[150px]">Feature Name</th>
                  <th className="border border-gray-300 px-2 py-3 text-left font-medium">Type</th>
                  <th className="border border-gray-300 px-2 py-3 text-left font-medium min-w-[120px]">Step 1 Name</th>
                  <th className="border border-gray-300 px-2 py-3 text-left font-medium min-w-[200px]">Step 1 Value</th>
                  <th className="border border-gray-300 px-2 py-3 text-left font-medium min-w-[120px]">Step 2 Name</th>
                  <th className="border border-gray-300 px-2 py-3 text-left font-medium min-w-[200px]">Step 2 Value</th>
                  <th className="border border-gray-300 px-2 py-3 text-left font-medium min-w-[120px]">Step 3 Name</th>
                  <th className="border border-gray-300 px-2 py-3 text-left font-medium min-w-[200px]">Step 3 Value</th>
                  <th className="border border-gray-300 px-2 py-3 text-left font-medium min-w-[120px]">Step 4 Name</th>
                  <th className="border border-gray-300 px-2 py-3 text-left font-medium min-w-[200px]">Step 4 Value</th>
                </tr>
              </thead>
              <tbody>
                {localFeatures.map((feature, index) => (
                  <tr key={feature.id} className="hover:bg-gray-50">
                    {/* Actions */}
                    <td className="border border-gray-300 px-2 py-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moveFeature(index, index - 1)}
                          disabled={index === 0}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          onClick={() => moveFeature(index, index + 1)}
                          disabled={index === localFeatures.length - 1}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ArrowDown size={14} />
                        </button>
                        <button
                          onClick={() => removeFeature(feature.id)}
                          className="text-red-500 hover:text-red-700 ml-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>

                    {/* Order */}
                    <td className="border border-gray-300 px-2 py-2 text-center font-medium">
                      {feature.order}
                    </td>

                    {/* Feature Name */}
                    <td className="border border-gray-300 px-2 py-2">
                      <input
                        type="text"
                        value={feature.name}
                        onChange={(e) => updateFeature(feature.id, 'name', e.target.value)}
                        placeholder="Feature name"
                        className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>

                    {/* Type */}
                    <td className="border border-gray-300 px-2 py-2">
                      <select
                        value={feature.type}
                        onChange={(e) => updateFeature(feature.id, 'type', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="numerical">Numerical</option>
                        <option value="categorical">Categorical</option>
                        <option value="boolean">Boolean</option>
                        <option value="datetime">DateTime</option>
                      </select>
                    </td>

                    {/* Preprocessing Steps */}
                    {[1, 2, 3, 4].map(stepNum => (
                      <React.Fragment key={stepNum}>
                        {/* Step Name */}
                        <td className="border border-gray-300 px-2 py-2">
                          <select
                            value={(feature[`step${stepNum}` as keyof Feature] as PreprocessingStep)?.name || ''}
                            onChange={(e) => updateFeature(feature.id, `step${stepNum}.name`, e.target.value)}
                            className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="">Select step...</option>
                            {COMMON_PREPROCESSING_STEPS.map(step => (
                              <option key={step} value={step}>{step}</option>
                            ))}
                          </select>
                        </td>
                        
                        {/* Step Value */}
                        <td className="border border-gray-300 px-2 py-2">
                          <textarea
                            value={(feature[`step${stepNum}` as keyof Feature] as PreprocessingStep)?.value || ''}
                            onChange={(e) => updateFeature(feature.id, `step${stepNum}.value`, e.target.value)}
                            placeholder="Step configuration/value"
                            rows={2}
                            className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                          />
                        </td>
                      </React.Fragment>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {localFeatures.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No features added yet. Click "Add Feature" to get started.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {localFeatures.length} feature{localFeatures.length !== 1 ? 's' : ''} configured
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Save Features
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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
      type: '',
      transformation: '',
      description: '',
      sourceTable: '',
      dataField: '',
      nullImputedValue: '',
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
    console.log('updateFeature called:', { id, field, value });
    setLocalFeatures(prev => {
      const updated = prev.map(feature => {
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
          const updatedFeature = { ...feature, [field]: value };
          console.log('Feature updated:', updatedFeature);
          return updatedFeature;
        }
        return feature;
      });
      console.log('All features after update:', updated);
      return updated;
    });
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
    const headers = ['Order', 'Model Feature Name', 'Source Table Name', 'Data Field Name', 'Num/Cat', 'Transformation(s)', 'Null Imputed Value'];
    
    const csvContent = [
      headers.join(','),
      ...localFeatures.map(f => [
        f.order,
        f.name,
        f.sourceTable || '',
        f.dataField || '',
        f.type,
        f.transformation || '',
        f.nullImputedValue || ''
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
          
          // Process transformation string to map known values to our toggle format
          const transformationText = (values[5] || '').toLowerCase();
          const transformations = [];
          
          console.log('Processing transformation text:', transformationText);
          
          // Map common transformation patterns to our toggle values
          if (transformationText) {
            // Check for clipping patterns - handle both "capped" and "clipping"
            if (transformationText.includes('capped') || 
                transformationText.includes('cap') || 
                transformationText.includes('floor') ||
                transformationText.includes('clip')) {
              transformations.push('clipping');
            }
            
            // Check for binning patterns  
            if (transformationText.includes('binned') || 
                transformationText.includes('bin') ||
                transformationText.includes('bucketing')) {
              transformations.push('binning');
            }
            
            // Check for encoding patterns
            if (transformationText.includes('encoding') || 
                transformationText.includes('woe') || 
                transformationText.includes('encode') ||
                transformationText.includes('weight of evidence')) {
              transformations.push('encoding');
            }
            
            // If no mapping found, keep original value but try to map single words
            if (transformations.length === 0) {
              const words = transformationText.split(/[,\s]+/).filter(w => w.trim());
              for (const word of words) {
                if (word === 'capped' || word === 'cap') {
                  transformations.push('clipping');
                } else if (word === 'binned' || word === 'bin') {
                  transformations.push('binning');
                } else if (word === 'encoding' || word === 'encode' || word === 'woe') {
                  transformations.push('encoding');
                }
              }
            }
          }
          
          const processedTransformation = transformations.join(', ');
          console.log('CSV Import - Feature:', values[1], 'Original transform:', values[5], 'Processed:', processedTransformation);
          
          const featureData = {
            id: Date.now().toString() + index,
            order: parseInt(values[0]) || index + 1,
            name: values[1] || '',
            sourceTable: values[2] || '',
            dataField: values[3] || '',
            type: (values[4] as Feature['type']) || '' as Feature['type'],
            transformation: processedTransformation,
            nullImputedValue: values[6] || '',
            description: '',
            step1: { name: '', value: '' },
            step2: { name: '', value: '' },
            step3: { name: '', value: '' },
            step4: { name: '', value: '' }
          } as Feature;
          
          console.log('Created feature object:', featureData);
          return featureData;
        });
      
      console.log('Imported features:', importedFeatures);
      setLocalFeatures(importedFeatures);
      
      // Force a re-render to ensure the UI updates
      setTimeout(() => {
        console.log('Current localFeatures after import:', importedFeatures);
      }, 100);
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
                  <th className="border border-gray-300 px-2 py-3 text-left font-medium text-gray-800">Actions</th>
                  <th className="border border-gray-300 px-2 py-3 text-left font-medium text-gray-800">Order</th>
                  <th className="border border-gray-300 px-2 py-3 text-left font-medium text-gray-800 min-w-[150px]">Model Feature Name</th>
                  <th className="border border-gray-300 px-2 py-3 text-left font-medium text-gray-800 min-w-[150px]">Source Table Name</th>
                  <th className="border border-gray-300 px-2 py-3 text-left font-medium text-gray-800 min-w-[150px]">Data Field Name</th>
                  <th className="border border-gray-300 px-2 py-3 text-left font-medium text-gray-800 min-w-[80px]">Num/Cat</th>
                  <th className="border border-gray-300 px-2 py-3 text-left font-medium text-gray-800 min-w-[120px]">Transformation(s)</th>
                  <th className="border border-gray-300 px-2 py-3 text-left font-medium text-gray-800 min-w-[120px]">Null Imputed Value</th>
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

                    {/* Model Feature Name */}
                    <td className="border border-gray-300 px-2 py-2">
                      <input
                        type="text"
                        value={feature.name}
                        onChange={(e) => updateFeature(feature.id, 'name', e.target.value)}
                        placeholder="Model feature name"
                        className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                      />
                    </td>

                    {/* Source Table Name */}
                    <td className="border border-gray-300 px-2 py-2">
                      <input
                        type="text"
                        value={feature.sourceTable || ''}
                        onChange={(e) => updateFeature(feature.id, 'sourceTable', e.target.value)}
                        placeholder="Source table name"
                        className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                      />
                    </td>

                    {/* Data Field Name */}
                    <td className="border border-gray-300 px-2 py-2">
                      <input
                        type="text"
                        value={feature.dataField || ''}
                        onChange={(e) => updateFeature(feature.id, 'dataField', e.target.value)}
                        placeholder="Data field name"
                        className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                      />
                    </td>

                    {/* Num/Cat Type */}
                    <td className="border border-gray-300 px-2 py-2">
                      <select
                        value={feature.type}
                        onChange={(e) => updateFeature(feature.id, 'type', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 bg-white"
                      >
                        <option value="">Select...</option>
                        <option value="Num">Num</option>
                        <option value="Cat">Cat</option>
                      </select>
                    </td>

                    {/* Transformation(s) */}
                    <td className="border border-gray-300 px-2 py-2">
                      <div className="flex flex-col gap-1">
                        {['clipping', 'binning', 'encoding'].map((transformType) => {
                          // Simple and robust way to check if transformation is active
                          const transformationString = feature.transformation || '';
                          const isActive = transformationString.includes(transformType);
                          
                          console.log(`Feature ${feature.name} - Transform ${transformType}:`, {
                            transformationString,
                            isActive,
                            includes: transformationString.includes(transformType)
                          });
                          
                          return (
                            <button
                              key={transformType}
                              onClick={() => {
                                console.log('Toggle clicked:', transformType, 'Current state:', isActive);
                                console.log('Current transformation string:', feature.transformation);
                                
                                const currentTransformations = feature.transformation ? 
                                  feature.transformation.split(',').map(t => t.trim()).filter(t => t) : [];
                                
                                console.log('Parsed transformations:', currentTransformations);
                                
                                let newTransformations;
                                if (isActive) {
                                  // Remove transformation
                                  newTransformations = currentTransformations.filter(t => t !== transformType);
                                } else {
                                  // Add transformation
                                  newTransformations = [...currentTransformations, transformType];
                                }
                                
                                console.log('New transformations array:', newTransformations);
                                const newTransformationString = newTransformations.join(', ');
                                console.log('New transformation string:', newTransformationString);
                                
                                updateFeature(feature.id, 'transformation', newTransformationString);
                              }}
                              className={`
                                px-2 py-1 text-xs rounded border transition-all duration-200 w-full text-left
                                ${isActive 
                                  ? 'bg-blue-600 text-white border-blue-700 shadow-md font-medium' 
                                  : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                                }
                              `}
                            >
                              <span className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-gray-300'}`}></div>
                                {transformType}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </td>

                    {/* Null Imputed Value */}
                    <td className="border border-gray-300 px-2 py-2">
                      <input
                        type="text"
                        value={feature.nullImputedValue || ''}
                        onChange={(e) => updateFeature(feature.id, 'nullImputedValue', e.target.value)}
                        placeholder="Null imputed value"
                        className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                      />
                    </td>
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
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-gray-900 bg-white"
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

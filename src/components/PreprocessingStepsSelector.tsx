'use client';

import { useState } from 'react';
import { ArrowUp, ArrowDown, Settings, Check, X } from 'lucide-react';

interface PreprocessingPipelineStep {
  id: string;
  name: string;
  description: string;
  dataTypes: ('numeric' | 'categorical' | 'both')[];
  order: number;
  enabled: boolean;
  config?: Record<string, any>;
}

interface PreprocessingStepsSelectorProps {
  steps: PreprocessingPipelineStep[];
  onChange: (steps: PreprocessingPipelineStep[]) => void;
}

const DEFAULT_STEPS: Omit<PreprocessingPipelineStep, 'order' | 'enabled'>[] = [
  {
    id: 'clipping',
    name: 'Clipping',
    description: 'Apply clipping to handle outliers in numeric variables',
    dataTypes: ['numeric'],
    config: { min_value: -999999, max_value: 1000 }
  },
  {
    id: 'encoding',
    name: 'Encoding',
    description: 'Encode categorical variables with integer mapping',
    dataTypes: ['categorical'],
    config: { handle_unknown: 'use_encoded_value', unknown_value: 0 }
  },
  {
    id: 'binning',
    name: 'Binning',
    description: 'Bin numeric columns into discrete intervals',
    dataTypes: ['numeric'],
    config: { n_bins: 50, strategy: 'quantile' }
  },
  {
    id: 'imputation',
    name: 'Imputation',
    description: 'Impute missing values in features',
    dataTypes: ['both'],
    config: { strategy: 'constant', fill_value: 0 }
  }
];

export default function PreprocessingStepsSelector({ steps, onChange }: PreprocessingStepsSelectorProps) {
  const [localSteps, setLocalSteps] = useState<PreprocessingPipelineStep[]>(() => {
    if (steps.length === 0) {
      return DEFAULT_STEPS.map((step, index) => ({
        ...step,
        order: index + 1,
        enabled: true
      }));
    }
    return steps;
  });

  const updateSteps = (newSteps: PreprocessingPipelineStep[]) => {
    setLocalSteps(newSteps);
    onChange(newSteps);
  };

  const toggleStep = (stepId: string) => {
    const updated = localSteps.map(step => 
      step.id === stepId ? { ...step, enabled: !step.enabled } : step
    );
    updateSteps(updated);
  };

  const moveStep = (stepId: string, direction: 'up' | 'down') => {
    const currentIndex = localSteps.findIndex(step => step.id === stepId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= localSteps.length) return;

    const updated = [...localSteps];
    [updated[currentIndex], updated[newIndex]] = [updated[newIndex], updated[currentIndex]];
    
    // Update order numbers
    updated.forEach((step, index) => {
      step.order = index + 1;
    });

    updateSteps(updated);
  };

  const resetToDefault = () => {
    const defaultSteps = DEFAULT_STEPS.map((step, index) => ({
      ...step,
      order: index + 1,
      enabled: true
    }));
    updateSteps(defaultSteps);
  };

  const enabledSteps = localSteps.filter(step => step.enabled);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-800">Preprocessing Steps Order</h3>
        <button
          onClick={resetToDefault}
          className="text-sm text-blue-600 hover:text-blue-700 underline"
        >
          Reset to Default
        </button>
      </div>

      {/* <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 mb-2">Steps to pre-process dataset</h4>
        <div className="space-y-2">
          {enabledSteps.map(step => (
            <div key={step.id} className="text-sm text-yellow-700">
              <span className="font-medium">{step.order}. {step.name}</span>
              {step.dataTypes.includes('categorical') && step.dataTypes.includes('numeric') ? ' (Both)' : 
               step.dataTypes.includes('categorical') ? ' (Categorical)' :
               step.dataTypes.includes('numeric') ? ' (Numeric)' : ''}
            </div>
          ))}
        </div>
      </div> */}

      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <h4 className="font-medium text-gray-800">Configure Preprocessing Order</h4>
          <p className="text-sm text-gray-600 mt-1">
            Enable/disable steps and use arrows to reorder. Enabled steps will be applied in the order shown.
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {localSteps.map((step, index) => (
            <div key={step.id} className={`p-4 ${!step.enabled ? 'bg-gray-50 opacity-60' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => toggleStep(step.id)}
                    className={`p-1 rounded ${
                      step.enabled 
                        ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    {step.enabled ? <Check size={16} /> : <X size={16} />}
                  </button>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                        {step.order}
                      </span>
                      <h5 className="font-medium text-gray-800">{step.name}</h5>
                      <span className="text-xs text-gray-500">
                        ({step.dataTypes.join(', ')})
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => moveStep(step.id, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    onClick={() => moveStep(step.id, 'down')}
                    disabled={index === localSteps.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <Settings size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">Preprocessing Summary</h4>
        <p className="text-sm text-blue-700">
          <strong>{enabledSteps.length}</strong> steps enabled out of 4 total preprocessing steps.
          {enabledSteps.length > 0 && (
            <><br />Order: {enabledSteps.map(s => s.name).join(' → ')}</>
          )}
        </p>
      </div>
    </div>
  );
}

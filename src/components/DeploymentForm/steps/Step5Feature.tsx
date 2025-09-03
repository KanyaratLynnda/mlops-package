// src/components/DeploymentForm/steps/Step5Features.tsx
'use client';

import { Database, Table, Eye } from 'lucide-react';
import { useFormContext } from '../FormProvider';
import { useState } from 'react';
import { Feature } from '@/types/form';
import FeatureTableModal from '../FeatureTableModal';

export default function Step5Features() {
  const { state, updateField, updateArrayField } = useFormContext();
  const { data } = state;
  
  const [features, setFeatures] = useState<Feature[]>(data.features || []);
  const [showModal, setShowModal] = useState(false);

  const handleSaveFeatures = (updatedFeatures: Feature[]) => {
    setFeatures(updatedFeatures);
    // Update the form data when modal saves
    updateArrayField('features', updatedFeatures);
  };

  const getStepSummary = (feature: Feature) => {
    const steps = [feature.step1, feature.step2, feature.step3, feature.step4]
      .filter(step => step?.name)
      .map(step => step?.name);
    return steps.length > 0 ? steps.join(' → ') : 'No preprocessing steps';
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Database className="text-indigo-600" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Model Features & Preprocessing</h2>
        <p className="text-gray-600">Configure features and their preprocessing steps</p>
      </div>

      {/* Summary Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-blue-800">Features Configuration</h3>
            <p className="text-blue-600 text-sm">
              {features.length} feature{features.length !== 1 ? 's' : ''} configured with preprocessing steps
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
          >
            <Table size={20} />
            📊 Edit Features Table
          </button>
        </div>

        {features.length > 0 && (
          <div className="bg-white rounded-lg p-4 max-h-64 overflow-y-auto">
            <div className="space-y-3">
              {features.slice(0, 5).map((feature, index) => (
                <div key={feature.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium">
                        {feature.order}
                      </span>
                      <span className="font-medium text-gray-800">{feature.name}</span>
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                        {feature.type}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1 ml-10">
                      {getStepSummary(feature)}
                    </div>
                  </div>
                </div>
              ))}
              
              {features.length > 5 && (
                <div className="text-center py-2 text-gray-500 text-sm">
                  ... and {features.length - 5} more features
                </div>
              )}
            </div>
          </div>
        )}

        {features.length === 0 && (
          <div className="bg-white rounded-lg p-8 text-center">
            <Database className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-500 mb-4">No features configured yet</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Your First Feature
            </button>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <button
          onClick={() => setShowModal(true)}
          className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
        >
          <Eye size={16} />
          View/Edit All Features
        </button>
      </div>

      {/* Feature Engineering Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Feature Engineering Notes
        </label>
        <textarea
          value={data.featureNotes}
          onChange={(e) => updateField('featureNotes', e.target.value)}
          placeholder="Any additional notes about feature engineering, selection methodology, preprocessing rationale, etc."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 bg-white"
        />
      </div>

      {/* Modal */}
      <FeatureTableModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        features={features}
        onSave={handleSaveFeatures}
      />
    </div>
  );
}
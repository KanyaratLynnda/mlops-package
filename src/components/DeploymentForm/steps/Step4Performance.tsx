// src/components/DeploymentForm/steps/Step4Performance.tsx
'use client';

import { Settings, Check } from 'lucide-react';
import { useFormContext } from '../FormProvider';

export default function Step4Performance() {
  const { state, updateField } = useFormContext();
  const { data, errors } = state;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Settings className="text-orange-600" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Model Performance</h2>
        <p className="text-gray-600">What are your model's performance metrics?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            AUC (%)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={data.auc}
            onChange={(e) => updateField('auc', e.target.value)}
            placeholder="67.77"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            F1 Score (%)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={data.f1Score}
            onChange={(e) => updateField('f1Score', e.target.value)}
            placeholder="1.21"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Precision (%)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={data.precision}
            onChange={(e) => updateField('precision', e.target.value)}
            placeholder="0.61"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recall (%)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={data.recall}
            onChange={(e) => updateField('recall', e.target.value)}
            placeholder="57.84"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Performance Notes
        </label>
        <textarea
          value={data.performanceNotes}
          onChange={(e) => updateField('performanceNotes', e.target.value)}
          placeholder="Any additional notes about model performance, validation methodology, etc."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {errors.performance && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{errors.performance}</p>
        </div>
      )}
    </div>
  );
}
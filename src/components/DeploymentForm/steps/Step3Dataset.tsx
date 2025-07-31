// src/components/DeploymentForm/steps/Step3Dataset.tsx
'use client';

import { Database, AlertCircle } from 'lucide-react';
import { useFormContext } from '../FormProvider';

export default function Step3Dataset() {
  const { state, updateField } = useFormContext();
  const { data, errors } = state;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Database className="text-green-600" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Dataset Configuration</h2>
        <p className="text-gray-600">Specify your BigQuery tables and data structure</p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium mb-4">BigQuery Project & Tables</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.projectId}
              onChange={(e) => updateField('projectId', e.target.value)}
              placeholder="ds-dev-289802"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.projectId ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.projectId && (
              <p className="text-red-500 text-sm mt-1">{errors.projectId}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Training Table <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.trainTable}
              onChange={(e) => updateField('trainTable', e.target.value)}
              placeholder="dataset.train_table"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.trainTable ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.trainTable && (
              <p className="text-red-500 text-sm mt-1">{errors.trainTable}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Table <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.testTable}
              onChange={(e) => updateField('testTable', e.target.value)}
              placeholder="dataset.test_table"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.testTable ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.testTable && (
              <p className="text-red-500 text-sm mt-1">{errors.testTable}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Validation Table <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.valTable}
              onChange={(e) => updateField('valTable', e.target.value)}
              placeholder="dataset.val_table"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.valTable ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.valTable && (
              <p className="text-red-500 text-sm mt-1">{errors.valTable}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OOT Table (Optional)
            </label>
            <input
              type="text"
              value={data.ootTable}
              onChange={(e) => updateField('ootTable', e.target.value)}
              placeholder="dataset.oot_table"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium mb-4">Data Structure</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Population Key <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.populationKey}
              onChange={(e) => updateField('populationKey', e.target.value)}
              placeholder="customer_id, contact_adw_key"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.populationKey ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.populationKey && (
              <p className="text-red-500 text-sm mt-1">{errors.populationKey}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Column <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.targetColumn}
              onChange={(e) => updateField('targetColumn', e.target.value)}
              placeholder="target, label, y"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.targetColumn ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.targetColumn && (
              <p className="text-red-500 text-sm mt-1">{errors.targetColumn}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exclusion Criteria
            </label>
            <textarea
              value={data.exclusionCriteria}
              onChange={(e) => updateField('exclusionCriteria', e.target.value)}
              placeholder="Describe any data exclusions (e.g., inactive customers, test accounts...)"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="text-blue-600 mr-2 mt-0.5" size={16} />
          <div>
            <h4 className="font-medium text-blue-800">Table Validation</h4>
            <p className="text-sm text-blue-700 mt-1">
              We'll automatically validate table existence and schema compatibility during processing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
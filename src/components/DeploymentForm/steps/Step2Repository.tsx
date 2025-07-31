// src/components/DeploymentForm/steps/Step2Repository.tsx
'use client';

import { Database } from 'lucide-react';
import { useFormContext } from '../FormProvider';

export default function Step2Repository() {
  const { state, updateField } = useFormContext();
  const { data, errors } = state;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Database className="text-purple-600" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Repository Information</h2>
        <p className="text-gray-600">Where is your model code stored?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Repository URL <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            value={data.repositoryUrl}
            onChange={(e) => updateField('repositoryUrl', e.target.value)}
            placeholder="https://github.com/company/model-repo or https://bitbucket.org/..."
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.repositoryUrl ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.repositoryUrl && (
            <p className="text-red-500 text-sm mt-1">{errors.repositoryUrl}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Branch <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.branch}
            onChange={(e) => updateField('branch', e.target.value)}
            placeholder="main, master, develop"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.branch ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.branch && (
            <p className="text-red-500 text-sm mt-1">{errors.branch}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Commit Hash
          </label>
          <input
            type="text"
            value={data.commitHash}
            onChange={(e) => updateField('commitHash', e.target.value)}
            placeholder="f1186fd (optional)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
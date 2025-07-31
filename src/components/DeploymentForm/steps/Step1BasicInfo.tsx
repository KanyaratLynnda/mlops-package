// src/components/DeploymentForm/steps/Step1BasicInfo.tsx
'use client';

import { FileText } from 'lucide-react';
import { useFormContext } from '../FormProvider';

export default function Step1BasicInfo() {
  const { state, updateField } = useFormContext();
  const { data, errors } = state;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="text-blue-600" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Basic Initiative Information</h2>
        <p className="text-gray-600">Tell us about your initiative and its purpose</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Initiative Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.initiativeName}
            onChange={(e) => updateField('initiativeName', e.target.value)}
            placeholder="e.g., hertz_discount, customer_churn"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.initiativeName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.initiativeName && (
            <p className="text-red-500 text-sm mt-1">{errors.initiativeName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Model Version <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.modelVersion}
            onChange={(e) => updateField('modelVersion', e.target.value)}
            placeholder="e.g., v1.0, v2.1"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.modelVersion ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.modelVersion && (
            <p className="text-red-500 text-sm mt-1">{errors.modelVersion}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Model Type <span className="text-red-500">*</span>
          </label>
          <select
            value={data.modelType}
            onChange={(e) => updateField('modelType', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.modelType ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select model type</option>
            <option value="lightgbm">LightGBM</option>
            <option value="xgboost">XGBoost</option>
            <option value="sklearn">Scikit-learn</option>
            <option value="tensorflow">TensorFlow</option>
            <option value="pytorch">PyTorch</option>
          </select>
          {errors.modelType && (
            <p className="text-red-500 text-sm mt-1">{errors.modelType}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data Scientist <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={data.dataScientist}
            onChange={(e) => updateField('dataScientist', e.target.value)}
            placeholder="your.email@company.com"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.dataScientist ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.dataScientist && (
            <p className="text-red-500 text-sm mt-1">{errors.dataScientist}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Deployment Date
          </label>
          <input
            type="date"
            value={data.targetDeploymentDate}
            onChange={(e) => updateField('targetDeploymentDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Business Purpose <span className="text-red-500">*</span>
        </label>
        <textarea
          value={data.businessPurpose}
          onChange={(e) => updateField('businessPurpose', e.target.value)}
          placeholder="Describe what this model does and its business impact..."
          rows={4}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.businessPurpose ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.businessPurpose && (
          <p className="text-red-500 text-sm mt-1">{errors.businessPurpose}</p>
        )}
      </div>
    </div>
  );
}
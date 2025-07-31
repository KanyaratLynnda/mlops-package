// src/components/DeploymentForm/steps/Step7Infrastructure.tsx
'use client';

import { Zap, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useFormContext } from '../FormProvider';

export default function Step7Infrastructure() {
  const { state, updateField, updateArrayField } = useFormContext();
  const { data } = state;

  const [alertEmails, setAlertEmails] = useState<string[]>(data.alertEmails || ['']);
  const [infraConfig, setInfraConfig] = useState({
    machineType: data.machineType || 'n1-standard-4',
    maxWorkers: data.maxWorkers || '10',
    diskSize: data.diskSize || '100',
    schedule: data.schedule || '0 6 * * *'
  });

  // No automatic syncing - only sync when user navigates
  // The form will be synced when nextStep is called

  const addEmailAlert = () => {
    setAlertEmails(prev => [...prev, '']);
  };

  const updateEmailAlert = (index: number, value: string) => {
    setAlertEmails(prev => prev.map((email, i) => i === index ? value : email));
  };

  const removeEmailAlert = (index: number) => {
    setAlertEmails(prev => prev.filter((_, i) => i !== index));
  };

  const updateInfraConfig = (field: string, value: string) => {
    setInfraConfig(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Zap className="text-red-600" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Infrastructure & Alerts</h2>
        <p className="text-gray-600">Configure deployment infrastructure and monitoring</p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium mb-4">Dataflow Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Machine Type
            </label>
            <select
              value={infraConfig.machineType}
              onChange={(e) => updateInfraConfig('machineType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="n1-standard-2">n1-standard-2</option>
              <option value="n1-standard-4">n1-standard-4</option>
              <option value="n1-standard-8">n1-standard-8</option>
              <option value="n1-highmem-4">n1-highmem-4</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Workers
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={infraConfig.maxWorkers}
              onChange={(e) => updateInfraConfig('maxWorkers', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Disk Size (GB)
            </label>
            <input
              type="number"
              min="50"
              max="1000"
              value={infraConfig.diskSize}
              onChange={(e) => updateInfraConfig('diskSize', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium mb-4">Scheduling</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cron Schedule
          </label>
          <select
            value={infraConfig.schedule}
            onChange={(e) => updateInfraConfig('schedule', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="0 6 * * *">Daily at 6:00 AM</option>
            <option value="0 2 * * 1">Weekly on Monday at 2:00 AM</option>
            <option value="0 3 1 * *">Monthly on 1st at 3:00 AM</option>
            <option value="">Manual trigger only</option>
          </select>
        </div>
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg">
        <h3 className="font-medium mb-4">Alert Emails</h3>
        <div className="space-y-3">
          {alertEmails.map((email, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => updateEmailAlert(index, e.target.value)}
                placeholder="email@company.com"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {alertEmails.length > 1 && (
                <button
                  onClick={() => removeEmailAlert(index)}
                  type="button"
                  className="text-red-600 hover:text-red-700 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addEmailAlert}
            type="button"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1"
          >
            <Plus size={16} />
            Add Email
          </button>
        </div>
      </div>
    </div>
  );
}
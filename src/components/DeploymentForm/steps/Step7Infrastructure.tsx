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
    maxWorkers: data.maxWorkers || '50',
    diskSize: data.diskSize || '100',
    schedule: data.schedule || '0 6 * * *'
  });

  // Parse existing cron or set defaults
  const parseCron = (cronString: string) => {
    const parts = cronString.split(' ');
    return {
      minute: parts[0] || '*',
      hour: parts[1] || '*',
      dayOfMonth: parts[2] || '*',
      month: parts[3] || '*',
      dayOfWeek: parts[4] || '*'
    };
  };

  const [cronConfig, setCronConfig] = useState(() => parseCron(infraConfig.schedule));

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

  const updateCronConfig = (field: string, value: string) => {
    setCronConfig(prev => {
      const newCron = { ...prev, [field]: value };
      const cronString = `${newCron.minute} ${newCron.hour} ${newCron.dayOfMonth} ${newCron.month} ${newCron.dayOfWeek}`;
      setInfraConfig(prevInfra => ({ ...prevInfra, schedule: cronString }));
      return newCron;
    });
  };

  // Generate options for dropdowns
  const generateOptions = (start: number, end: number, prefix = '') => {
    const options = [{ value: '*', label: 'N/A' }];
    for (let i = start; i <= end; i++) {
      options.push({ value: i.toString(), label: `${prefix}${i}` });
    }
    return options;
  };

  const minuteOptions = generateOptions(0, 59);
  const hourOptions = generateOptions(0, 23);
  const dayOfMonthOptions = generateOptions(1, 31);
  const monthOptions = generateOptions(1, 12);
  const dayOfWeekOptions = [
    { value: '*', label: 'N/A' },
    { value: '0', label: 'Sunday' },
    { value: '1', label: 'Monday' },
    { value: '2', label: 'Tuesday' },
    { value: '3', label: 'Wednesday' },
    { value: '4', label: 'Thursday' },
    { value: '5', label: 'Friday' },
    { value: '6', label: 'Saturday' }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Zap className="text-red-600" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Infrastructure & Alerts</h2>
        <p className="text-gray-600">Configure deployment infrastructure and monitoring</p>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium mb-4 text-gray-800">Scheduling</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cron Schedule Configuration
            </label>
            <p className="text-xs text-gray-600 mb-3">
              Configure when your pipeline should run. Use "N/A" (*) for any value.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Minute (0-59)
              </label>
              <select
                value={cronConfig.minute}
                onChange={(e) => updateCronConfig('minute', e.target.value)}
                className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white text-sm"
              >
                {minuteOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Hour (0-23)
              </label>
              <select
                value={cronConfig.hour}
                onChange={(e) => updateCronConfig('hour', e.target.value)}
                className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white text-sm"
              >
                {hourOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Day of Month (1-31)
              </label>
              <select
                value={cronConfig.dayOfMonth}
                onChange={(e) => updateCronConfig('dayOfMonth', e.target.value)}
                className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white text-sm"
              >
                {dayOfMonthOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Month (1-12)
              </label>
              <select
                value={cronConfig.month}
                onChange={(e) => updateCronConfig('month', e.target.value)}
                className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white text-sm"
              >
                {monthOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Day of Week
              </label>
              <select
                value={cronConfig.dayOfWeek}
                onChange={(e) => updateCronConfig('dayOfWeek', e.target.value)}
                className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white text-sm"
              >
                {dayOfWeekOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-3 p-2 bg-gray-50 rounded border">
            <p className="text-xs text-gray-600">
              <strong>Current cron expression:</strong> <code className="bg-white px-1 rounded">{infraConfig.schedule}</code>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Format: minute hour day-of-month month day-of-week
            </p>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg">
        <h3 className="font-medium mb-4 text-gray-800">Alert Emails</h3>
        <div className="space-y-3">
          {alertEmails.map((email, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => updateEmailAlert(index, e.target.value)}
                placeholder="email@company.com"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 bg-white"
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
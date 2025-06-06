import { useMessageLimits } from '../hooks/useMessageLimits';

export function MessageLimitBanner() {
  const { currentPlan, used, limit, percentage, isNearLimit, isOverLimit } = useMessageLimits();

  if (!isNearLimit && !isOverLimit) return null;

  return (
    <div className={`p-4 rounded-lg mb-6 ${
      isOverLimit 
        ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' 
        : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`font-semibold ${
            isOverLimit ? 'text-red-800 dark:text-red-200' : 'text-yellow-800 dark:text-yellow-200'
          }`}>
            {isOverLimit ? 'Message Limit Exceeded' : 'Approaching Message Limit'}
          </h3>
          <p className={`text-sm ${
            isOverLimit ? 'text-red-600 dark:text-red-300' : 'text-yellow-600 dark:text-yellow-300'
          }`}>
            You've used {used} of {limit} messages this month ({percentage.toFixed(1)}%)
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                isOverLimit ? 'bg-red-500' : 'bg-yellow-500'
              }`}
              style={{ width: `${Math.min(100, percentage)}%` }}
            />
          </div>
          {currentPlan === 'free' && (
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              Upgrade Plan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

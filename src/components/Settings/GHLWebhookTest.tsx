import React, { useState } from 'react';
import { Send, CheckCircle, XCircle, Clock, Settings } from 'lucide-react';
import { ghlWebhookService } from '../../services/ghlWebhook';

interface TestResult {
  success: boolean;
  status: number;
  message: string;
  timestamp: string;
  response?: any;
}

const GHLWebhookTest: React.FC = () => {
  const [isTestingCreate, setIsTestingCreate] = useState(false);
  const [isTestingUpdate, setIsTestingUpdate] = useState(false);
  const [isTestingDelete, setIsTestingDelete] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  // Sample test data
  const sampleEventData = {
    id: 'test_' + Date.now(),
    client_id: 999,
    client_email: 'test@example.com',
    client_phone: '+60123456789',
    client_name: 'Test Client Sdn Bhd',
    title: 'Test Onboarding Session',
    type: 'onboarding' as const,
    start_date: '2024-02-01',
    end_date: '2024-02-01',
    start_time: '10:00',
    end_time: '11:00',
    description: 'This is a test webhook trigger for GHL automation setup',
    created_at: new Date().toISOString()
  };

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
  };

  const testWebhookCreate = async () => {
    setIsTestingCreate(true);
    try {
      console.log('🧪 Testing webhook CREATE trigger...');
      
      const result = await ghlWebhookService.triggerEventCreated(sampleEventData);
      
      addTestResult({
        success: result.success,
        status: result.success ? 200 : 500,
        message: result.success ? 'CREATE webhook triggered successfully' : (result.error || 'Unknown error'),
        timestamp: new Date().toISOString(),
        response: result
      });

      console.log('✅ CREATE test completed:', result);
    } catch (error) {
      console.error('❌ CREATE test failed:', error);
      addTestResult({
        success: false,
        status: 500,
        message: error instanceof Error ? error.message : 'Test failed',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsTestingCreate(false);
    }
  };

  const testWebhookUpdate = async () => {
    setIsTestingUpdate(true);
    try {
      console.log('🧪 Testing webhook UPDATE trigger...');
      
      const updateData = {
        ...sampleEventData,
        title: 'Updated Test Onboarding Session',
        description: 'This is an updated test webhook trigger for GHL automation',
        updated_at: new Date().toISOString()
      };

      const result = await ghlWebhookService.triggerEventUpdated(updateData);
      
      addTestResult({
        success: result.success,
        status: result.success ? 200 : 500,
        message: result.success ? 'UPDATE webhook triggered successfully' : (result.error || 'Unknown error'),
        timestamp: new Date().toISOString(),
        response: result
      });

      console.log('✅ UPDATE test completed:', result);
    } catch (error) {
      console.error('❌ UPDATE test failed:', error);
      addTestResult({
        success: false,
        status: 500,
        message: error instanceof Error ? error.message : 'Test failed',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsTestingUpdate(false);
    }
  };

  const testWebhookDelete = async () => {
    setIsTestingDelete(true);
    try {
      console.log('🧪 Testing webhook DELETE trigger...');
      
      // Create a mapping reference first for delete test
      await ghlWebhookService.createMappingReference(sampleEventData.id, 'test_ghl_appointment_123');
      
      const result = await ghlWebhookService.triggerEventDeleted(sampleEventData.id);
      
      addTestResult({
        success: result.success,
        status: result.success ? 200 : 500,
        message: result.success ? 'DELETE webhook triggered successfully' : (result.error || 'Unknown error'),
        timestamp: new Date().toISOString(),
        response: result
      });

      console.log('✅ DELETE test completed:', result);
    } catch (error) {
      console.error('❌ DELETE test failed:', error);
      addTestResult({
        success: false,
        status: 500,
        message: error instanceof Error ? error.message : 'Test failed',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsTestingDelete(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const copyPayload = (eventType: 'create' | 'update' | 'delete') => {
    let payload;
    
    if (eventType === 'create') {
      payload = {
        event_type: 'calendar_event_created',
        event_data: sampleEventData,
        reference_mapping: {
          sentra_event_id: sampleEventData.id,
          sync_status: 'pending'
        }
      };
    } else if (eventType === 'update') {
      payload = {
        event_type: 'calendar_event_updated',
        event_data: {
          ...sampleEventData,
          title: 'Updated Test Onboarding Session',
          updated_at: new Date().toISOString()
        },
        reference_mapping: {
          sentra_event_id: sampleEventData.id,
          ghl_appointment_id: 'test_ghl_appointment_123',
          sync_status: 'synced'
        }
      };
    } else {
      payload = {
        event_type: 'calendar_event_deleted',
        event_data: {
          sentra_event_id: sampleEventData.id
        },
        reference_mapping: {
          sentra_event_id: sampleEventData.id,
          ghl_appointment_id: 'test_ghl_appointment_123',
          sync_status: 'synced'
        }
      };
    }

    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    alert(`${eventType.toUpperCase()} payload copied to clipboard!`);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Settings className="w-6 h-6 text-blue-600" />
        <div>
          <h3 className="text-lg font-semibold text-slate-900">GHL Webhook Testing</h3>
          <p className="text-sm text-slate-600">Test webhook triggers for GHL automation setup</p>
        </div>
      </div>

      {/* Webhook URL Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-blue-900 mb-2">Webhook URL</h4>
        <code className="text-xs text-blue-800 break-all">
          https://services.leadconnectorhq.com/hooks/TQ5u2L7jxbXt7rPdOccp/webhook-trigger/acce4873-db55-46d6-b22d-9c1b79b86eda
        </code>
        <p className="text-xs text-blue-700 mt-2">
          Use this URL in your GHL automation workflow triggers
        </p>
      </div>

      {/* Test Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Test Create */}
        <div className="border border-slate-200 rounded-lg p-4">
          <h4 className="font-medium text-slate-900 mb-2">Test CREATE Event</h4>
          <p className="text-sm text-slate-600 mb-3">Triggers when new event is created</p>
          <div className="space-y-2">
            <button
              onClick={testWebhookCreate}
              disabled={isTestingCreate}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isTestingCreate ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Test CREATE</span>
                </>
              )}
            </button>
            <button
              onClick={() => copyPayload('create')}
              className="w-full px-4 py-1 text-sm text-green-600 border border-green-200 rounded hover:bg-green-50 transition-colors"
            >
              Copy Payload
            </button>
          </div>
        </div>

        {/* Test Update */}
        <div className="border border-slate-200 rounded-lg p-4">
          <h4 className="font-medium text-slate-900 mb-2">Test UPDATE Event</h4>
          <p className="text-sm text-slate-600 mb-3">Triggers when event is updated</p>
          <div className="space-y-2">
            <button
              onClick={testWebhookUpdate}
              disabled={isTestingUpdate}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isTestingUpdate ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Test UPDATE</span>
                </>
              )}
            </button>
            <button
              onClick={() => copyPayload('update')}
              className="w-full px-4 py-1 text-sm text-blue-600 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
            >
              Copy Payload
            </button>
          </div>
        </div>

        {/* Test Delete */}
        <div className="border border-slate-200 rounded-lg p-4">
          <h4 className="font-medium text-slate-900 mb-2">Test DELETE Event</h4>
          <p className="text-sm text-slate-600 mb-3">Triggers when event is deleted</p>
          <div className="space-y-2">
            <button
              onClick={testWebhookDelete}
              disabled={isTestingDelete}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isTestingDelete ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Test DELETE</span>
                </>
              )}
            </button>
            <button
              onClick={() => copyPayload('delete')}
              className="w-full px-4 py-1 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors"
            >
              Copy Payload
            </button>
          </div>
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-slate-900">Test Results</h4>
            <button
              onClick={clearResults}
              className="text-sm text-slate-600 hover:text-slate-800 transition-colors"
            >
              Clear Results
            </button>
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  result.success
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  {result.success ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${
                    result.success ? 'text-green-900' : 'text-red-900'
                  }`}>
                    Status {result.status}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className={`text-sm ${
                  result.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.message}
                </p>
                {result.response && (
                  <details className="mt-2">
                    <summary className="text-xs text-slate-600 cursor-pointer">
                      View Response
                    </summary>
                    <pre className="text-xs text-slate-700 mt-1 bg-white p-2 rounded border overflow-x-auto">
                      {JSON.stringify(result.response, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 bg-slate-50 border border-slate-200 rounded-lg p-4">
        <h4 className="font-medium text-slate-900 mb-2">Setup Instructions</h4>
        <ol className="text-sm text-slate-700 space-y-1 list-decimal list-inside">
          <li>Click the test buttons above to trigger sample webhooks</li>
          <li>Check your GHL automation to see if webhooks are received</li>
          <li>Use the "Copy Payload" buttons to see the exact data structure</li>
          <li>Configure your GHL automation workflow based on the payload structure</li>
          <li>Test each event type (CREATE, UPDATE, DELETE) as needed</li>
        </ol>
      </div>
    </div>
  );
};

export default GHLWebhookTest;
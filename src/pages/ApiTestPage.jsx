import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import api from '../utils/api';

const ApiTestPage = () => {
  const [endpoint, setEndpoint] = useState('/api/auth/profile');
  const [method, setMethod] = useState('GET');
  const [requestBody, setRequestBody] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const endpoints = [
    { label: 'Get Profile', method: 'GET', url: '/api/auth/profile' },
    { label: 'List Students', method: 'GET', url: '/api/sinh-vien' },
    { label: 'List Rooms', method: 'GET', url: '/api/phong' },
    { label: 'Student Detail', method: 'GET', url: '/api/sinh-vien/1' },
    { label: 'Room Detail', method: 'GET', url: '/api/phong/1' },
  ];

  const handleQuickSelect = (selectedEndpoint) => {
    setEndpoint(selectedEndpoint.url);
    setMethod(selectedEndpoint.method);
    setRequestBody('');
  };

  const handleSendRequest = async () => {
    setLoading(true);
    setResponse(null);

    try {
      let result;
      const config = {
        headers: {
          'Content-Type': 'application/json',
        }
      };

      // Add auth token if available
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      switch (method.toUpperCase()) {
        case 'GET':
          result = await api.get(endpoint, config);
          break;
        case 'POST':
          result = await api.post(endpoint, requestBody ? JSON.parse(requestBody) : {}, config);
          break;
        case 'PUT':
          result = await api.put(endpoint, requestBody ? JSON.parse(requestBody) : {}, config);
          break;
        case 'DELETE':
          result = await api.delete(endpoint, config);
          break;
        default:
          throw new Error('Unsupported method');
      }

      setResponse({
        status: result.status,
        statusText: result.statusText,
        data: result.data,
        headers: result.headers
      });

      toast.success('Request sent successfully');
    } catch (error) {
      console.error('API Test Error:', error);
      
      if (error.response) {
        setResponse({
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers,
          error: true
        });
      } else {
        setResponse({
          error: true,
          message: error.message || 'Network error'
        });
      }
      
      toast.error('Request failed');
    } finally {
      setLoading(false);
    }
  };

  const formatJson = (obj) => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">API Test Tool</h1>
          <p className="text-gray-600">Test các API endpoints của hệ thống</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Request Panel */}
          <div className="space-y-6">
            {/* Quick Select */}
            <Card title="Quick Select Endpoints">
              <div className="space-y-2">
                {endpoints.map((ep, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickSelect(ep)}
                    className="w-full justify-start text-left"
                  >
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded mr-2">
                      {ep.method}
                    </span>
                    {ep.label}
                  </Button>
                ))}
              </div>
            </Card>

            {/* Request Configuration */}
            <Card title="Request Configuration">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    HTTP Method
                  </label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Endpoint URL
                  </label>
                  <Input
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    placeholder="/api/..."
                    className="font-mono"
                  />
                </div>

                {(method === 'POST' || method === 'PUT') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Request Body (JSON)
                    </label>
                    <textarea
                      value={requestBody}
                      onChange={(e) => setRequestBody(e.target.value)}
                      placeholder='{"key": "value"}'
                      className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    />
                  </div>
                )}

                <Button
                  onClick={handleSendRequest}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Sending...' : 'Send Request'}
                </Button>
              </div>
            </Card>
          </div>

          {/* Response Panel */}
          <div>
            <Card title="Response">
              {response ? (
                <div className="space-y-4">
                  {/* Status */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Status:</span>
                    <span className={`px-2 py-1 rounded text-xs font-mono ${
                      response.error 
                        ? 'bg-red-100 text-red-800'
                        : response.status >= 200 && response.status < 300
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {response.status} {response.statusText}
                    </span>
                  </div>

                  {/* Response Data */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Response Data:
                    </label>
                    <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96 text-sm font-mono">
                      {formatJson(response.data || response.message)}
                    </pre>
                  </div>

                  {/* Headers */}
                  {response.headers && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Response Headers:
                      </label>
                      <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-40 text-sm font-mono">
                        {formatJson(response.headers)}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8">
                  No response yet. Send a request to see the response here.
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Current Auth Info */}
        <div className="mt-6">
          <Card title="Current Authentication">
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">Token Status:</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  localStorage.getItem('token') 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {localStorage.getItem('token') ? 'Authenticated' : 'Not authenticated'}
                </span>
              </div>
              {localStorage.getItem('token') && (
                <div className="text-sm font-mono text-gray-600 break-all">
                  Token: {localStorage.getItem('token').substring(0, 50)}...
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ApiTestPage;

// src/components/DebugLogViewer.tsx
'use client';

import { useState, useEffect } from 'react';

type LogEntry = {
  timestamp: string;
  level: string;
  message: string;
  context?: string;
  [key: string]: unknown;
};

export default function DebugLogViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [filter, setFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch logs from the API
  const fetchLogs = async () => {
    if (!isVisible) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/debug/logs?limit=50${levelFilter ? `&level=${levelFilter}` : ''}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
      }
    } catch (error: unknown) {
      console.error('Error fetching logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch logs periodically when visible
  useEffect(() => {
    if (!isVisible) return;

    // Fetch logs immediately
    fetchLogs();

    // Set up interval to fetch logs every 2 seconds
    const interval = setInterval(fetchLogs, 2000);

    return () => clearInterval(interval);
  }, [isVisible, levelFilter]);

  const filteredLogs = logs.filter(log => 
    log.message.toLowerCase().includes(filter.toLowerCase()) ||
    log.context?.toLowerCase().includes(filter.toLowerCase()) ||
    log.level.toLowerCase().includes(filter.toLowerCase())
  );

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-1 rounded text-sm z-50 hover:bg-gray-700 transition-colors"
      >
        Show Logs
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-96 bg-gray-900 text-white rounded-lg shadow-xl z-50 flex flex-col border border-gray-700">
      <div className="flex justify-between items-center p-2 bg-gray-800 rounded-t-lg">
        <h3 className="font-bold">Debug Logs</h3>
        <div className="flex space-x-2">
          <select
            className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
          >
            <option value="">All Levels</option>
            <option value="error">Error</option>
            <option value="warn">Warn</option>
            <option value="info">Info</option>
            <option value="debug">Debug</option>
          </select>
          <button
            onClick={fetchLogs}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-sm disabled:opacity-50"
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-sm"
          >
            Hide
          </button>
        </div>
      </div>
      
      <div className="flex p-2 bg-gray-800">
        <input
          type="text"
          placeholder="Filter logs..."
          className="flex-1 bg-gray-700 text-white px-2 py-1 rounded text-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 font-mono text-xs">
        {filteredLogs.length === 0 ? (
          <div className="text-gray-500 text-center py-4">
            {filter || levelFilter ? 'No matching logs' : 'No logs yet'}
          </div>
        ) : (
          filteredLogs.map((log, index) => (
            <div 
              key={index} 
              className={`p-1 border-b border-gray-800 ${
                log.level === 'error' ? 'text-red-400' : 
                log.level === 'warn' ? 'text-yellow-400' : 
                log.level === 'debug' ? 'text-blue-400' : 'text-gray-300'
              }`}
            >
              <div className="flex justify-between">
                <span className="text-gray-500 text-xs">
                  {new Date(log.timestamp).toTimeString().substring(0, 8)}
                </span>
                <span className={`font-bold text-xs ${
                  log.level === 'error' ? 'text-red-400' : 
                  log.level === 'warn' ? 'text-yellow-400' : 
                  log.level === 'info' ? 'text-cyan-400' : 
                  log.level === 'debug' ? 'text-blue-400' : 'text-gray-400'
                }`}>
                  {log.level.toUpperCase()}
                </span>
              </div>
              <div className="mt-1 break-words">{log.message}</div>
              {log.context && (
                <div className="text-gray-500 text-xs mt-1">Context: {log.context}</div>
              )}
              {Object.keys(log).filter(key => 
                !['timestamp', 'level', 'message', 'context'].includes(key)
              ).map(key => (
                <div key={key} className="text-gray-500 text-xs break-words">
                  {key}: {JSON.stringify(log[key])}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
      
      <div className="p-2 bg-gray-800 rounded-b-lg text-xs text-gray-500 flex justify-between">
        <span>Showing {filteredLogs.length} of {logs.length} logs</span>
        <span>{new Date().toTimeString().substring(0, 8)}</span>
      </div>
    </div>
  );
}
// src/components/DebugLogViewer.tsx
'use client';

import { useState, useEffect } from 'react';

type LogEntry = {
  timestamp: string;
  level: string;
  message: string;
  context?: string;
  [key: string]: any;
};

export default function DebugLogViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [filter, setFilter] = useState('');

  // In a real implementation, you would connect to a WebSocket or fetch logs from an API
  // For now, we'll simulate log entries
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      // Simulate receiving new log entries
      const newLog: LogEntry = {
        timestamp: new Date().toISOString(),
        level: ['info', 'warn', 'error'][Math.floor(Math.random() * 3)],
        message: `Simulated log entry ${Math.floor(Math.random() * 100)}`,
        context: ['api', 'database', 'auth'][Math.floor(Math.random() * 3)],
      };

      setLogs(prev => [newLog, ...prev.slice(0, 49)]); // Keep only the last 50 logs
    }, 2000);

    return () => clearInterval(interval);
  }, [isVisible]);

  const filteredLogs = logs.filter(log => 
    log.message.toLowerCase().includes(filter.toLowerCase()) ||
    log.context?.toLowerCase().includes(filter.toLowerCase()) ||
    log.level.toLowerCase().includes(filter.toLowerCase())
  );

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-1 rounded text-sm z-50"
      >
        Show Logs
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-96 bg-gray-900 text-white rounded-lg shadow-xl z-50 flex flex-col">
      <div className="flex justify-between items-center p-2 bg-gray-800 rounded-t-lg">
        <h3 className="font-bold">Debug Logs</h3>
        <div>
          <input
            type="text"
            placeholder="Filter logs..."
            className="bg-gray-700 text-white px-2 py-1 rounded text-sm mr-2"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <button
            onClick={() => setIsVisible(false)}
            className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-sm"
          >
            Hide
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 font-mono text-xs">
        {filteredLogs.length === 0 ? (
          <div className="text-gray-500 text-center py-4">
            {filter ? 'No matching logs' : 'No logs yet'}
          </div>
        ) : (
          filteredLogs.map((log, index) => (
            <div 
              key={index} 
              className={`p-1 border-b border-gray-800 ${
                log.level === 'error' ? 'text-red-400' : 
                log.level === 'warn' ? 'text-yellow-400' : 'text-gray-300'
              }`}
            >
              <div className="flex justify-between">
                <span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                <span className={`font-bold ${
                  log.level === 'error' ? 'text-red-400' : 
                  log.level === 'warn' ? 'text-yellow-400' : 'text-cyan-400'
                }`}>
                  {log.level.toUpperCase()}
                </span>
              </div>
              <div className="mt-1">{log.message}</div>
              {log.context && (
                <div className="text-gray-500 text-xs mt-1">Context: {log.context}</div>
              )}
              {Object.keys(log).filter(key => 
                !['timestamp', 'level', 'message', 'context'].includes(key)
              ).map(key => (
                <div key={key} className="text-gray-500 text-xs">
                  {key}: {JSON.stringify(log[key])}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
      
      <div className="p-2 bg-gray-800 rounded-b-lg text-xs text-gray-500">
        Showing {filteredLogs.length} of {logs.length} logs
      </div>
    </div>
  );
}
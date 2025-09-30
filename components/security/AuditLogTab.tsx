import React, { useState, FC, useMemo } from 'react';
import { auditLogService } from '../../services/auditLogService';

const AuditLogTab: FC = () => {
    const allLogs = useMemo(() => auditLogService.getLogs(), []);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState('all');
    const [visibleDetails, setVisibleDetails] = useState<number | null>(null);

    const uniqueUsers = useMemo(() => ['all', ...Array.from(new Set(allLogs.map(log => log.user)))], [allLogs]);

    const filteredLogs = useMemo(() => {
        return allLogs.filter(log => {
            const matchesUser = selectedUser === 'all' || log.user === selectedUser;
            const matchesSearch = searchTerm === '' || 
                log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase());
            return matchesUser && matchesSearch;
        });
    }, [allLogs, searchTerm, selectedUser]);
    
    return (
        <div className="bg-white p-6 rounded-lg shadow">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input type="text" placeholder="Search actions or details..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="col-span-1 md:col-span-2 p-2 border rounded-md"/>
                <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)} className="col-span-1 p-2 border rounded-md">
                    {uniqueUsers.map(user => <option key={user} value={user}>{user === 'all' ? 'All Users' : user}</option>)}
                </select>
             </div>
             <div className="overflow-x-auto">
                 <table className="min-w-full divide-y divide-gray-200">
                     <thead className="bg-gray-50">
                         <tr>
                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                         </tr>
                     </thead>
                     <tbody className="bg-white divide-y divide-gray-200">
                        {filteredLogs.map((log, index) => (
                            <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.timestamp.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.user} ({log.role})</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.action}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <button onClick={() => setVisibleDetails(visibleDetails === index ? null : index)} className="text-indigo-600 hover:underline">
                                       {visibleDetails === index ? 'Hide' : 'Show'} Details
                                    </button>
                                     {visibleDetails === index && (
                                        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded-md max-w-md overflow-auto">{JSON.stringify(log.details, null, 2)}</pre>
                                     )}
                                </td>
                            </tr>
                        ))}
                     </tbody>
                 </table>
             </div>
        </div>
    )
};

export default AuditLogTab;

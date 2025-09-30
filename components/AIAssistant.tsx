
import React, { useState, FC, useRef, useEffect } from 'react';
import { useApp } from '../hooks/useApp';
import { useNotifications } from './Notification';
import { aiOrchestrationService } from '../services/aiOrchestrationService';
import { inventoryService } from '../services/inventoryService';
import { complianceService } from '../services/complianceService';
// Fix: Corrected import path
import { rbacService } from '../services/rbacService';
import { SparklesIcon, ArrowPathIcon } from './icons';

interface AIAssistantProps {
    isOpen: boolean;
    onClose: () => void;
    currentPage: string;
}

interface Message {
    sender: 'user' | 'ai' | 'error';
    text: string;
}

export const AIAssistant: FC<AIAssistantProps> = ({ isOpen, onClose, currentPage }) => {
    const { currentUser } = useApp();
    const { addNotification } = useNotifications();
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;

        const newMessages: Message[] = [...messages, { sender: 'user', text: userInput }];
        setMessages(newMessages);
        setUserInput('');
        setIsLoading(true);

        try {
            const lowStockCount = inventoryService.getLowStockItems().length;
            const overdueComplianceCount = complianceService.getDocuments().filter(d => d.status === 'Overdue').length;
            const userPermissions = rbacService.getPermissionsForRole(currentUser.role);

            const payload = {
                userName: currentUser.name,
                userRole: currentUser.role,
                userPermissions,
                currentPage: currentPage,
                lowStockCount,
                overdueComplianceCount,
                question: userInput,
            };

            const result = await aiOrchestrationService.runTask<{ answer: string }>('APP_ASSISTANT', payload);
            setMessages([...newMessages, { sender: 'ai', text: result.answer }]);
        } catch (error: any) {
            const errorMessage = `Sorry, I encountered an error: ${error.message}`;
            setMessages([...newMessages, { sender: 'error', text: errorMessage }]);
            addNotification({ type: 'error', message: 'AI Assistant failed to respond.' });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg h-3/4 flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b flex items-center justify-between">
                    <div className="flex items-center">
                        <SparklesIcon className="w-6 h-6 text-indigo-600 mr-2" />
                        <h2 className="text-xl font-semibold">AI Assistant</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button>
                </header>

                <main className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                            {msg.sender !== 'user' && (
                                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white flex-shrink-0">
                                    <SparklesIcon className="w-5 h-5" />
                                </div>
                            )}
                            <div className={`max-w-md p-3 rounded-lg ${
                                msg.sender === 'user' ? 'bg-indigo-600 text-white' :
                                msg.sender === 'ai' ? 'bg-white border' :
                                'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white flex-shrink-0">
                                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                            </div>
                            <div className="max-w-md p-3 rounded-lg bg-white border">
                                <p className="text-sm text-gray-500">Thinking...</p>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </main>

                <footer className="p-4 border-t">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <input
                            type="text"
                            value={userInput}
                            onChange={e => setUserInput(e.target.value)}
                            placeholder="Ask a question..."
                            className="flex-1 p-2 border rounded-md"
                            disabled={isLoading}
                        />
                        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md disabled:bg-indigo-300" disabled={isLoading || !userInput.trim()}>
                            Send
                        </button>
                    </form>
                </footer>
            </div>
        </div>
    );
};
// Fix: Corrected import path
import { MOCK_CLINICAL_NOTES, MOCK_USERS } from '../constants';
// Fix: Corrected import path
import { ClinicalNote, User } from '../types';
import { v4 as uuidv4 } from 'uuid';

// In-memory store for demonstration
let notes: ClinicalNote[] = JSON.parse(JSON.stringify(MOCK_CLINICAL_NOTES)).map((n: ClinicalNote) => ({...n, timestamp: new Date(n.timestamp)}));

export const clinicalService = {
    // --- Data Retrieval ---
    getNotesForPatient: (patientId: string): (ClinicalNote & {author: User | undefined})[] => {
        return notes
            .filter(note => note.patientId === patientId)
            .map(note => ({
                ...note,
                author: MOCK_USERS.find(u => u.id === note.authorId)
            }))
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    },
    
    getNoteById: (noteId: string): ClinicalNote | undefined => {
        return notes.find(note => note.id === noteId);
    },

    // --- Data Mutation ---
    addNote: (noteData: Omit<ClinicalNote, 'id' | 'timestamp'>): ClinicalNote => {
        const newNote: ClinicalNote = {
            ...noteData,
            id: uuidv4(),
            timestamp: new Date(),
        };
        notes.unshift(newNote); // Add to the beginning
        return newNote;
    },

    updateNote: (noteId: string, updates: Partial<ClinicalNote>): ClinicalNote | undefined => {
        const index = notes.findIndex(note => note.id === noteId);
        if (index === -1) return undefined;
        notes[index] = { ...notes[index], ...updates };
        return notes[index];
    },

    deleteNote: (noteId: string): boolean => {
        const initialLength = notes.length;
        notes = notes.filter(note => note.id !== noteId);
        return notes.length < initialLength;
    },
};
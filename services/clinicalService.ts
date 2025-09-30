
import { MOCK_CLINICAL_NOTES, MOCK_USERS } from '../constants';
import { ClinicalNote, User } from '../types';
import { v4 as uuidv4 } from 'uuid';

let clinicalNotes: ClinicalNote[] = JSON.parse(JSON.stringify(MOCK_CLINICAL_NOTES)).map((note: any) => ({
    ...note,
    timestamp: new Date(note.timestamp)
}));

const users: User[] = MOCK_USERS;

export const clinicalService = {
    getNotesForPatient: (patientId: string): ClinicalNote[] => {
        return clinicalNotes
            .filter(note => note.patientId === patientId)
            .map(note => ({
                ...note,
                author: users.find(u => u.id === note.authorId)
            }))
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    },

    addNote: (noteData: Omit<ClinicalNote, 'id' | 'timestamp'>): ClinicalNote => {
        const newNote: ClinicalNote = {
            ...noteData,
            id: `note-${uuidv4()}`,
            timestamp: new Date()
        };
        clinicalNotes.unshift(newNote);
        return newNote;
    }
};
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useDashboardStore } from '@/store/use-dashboard-store';
import { NotebookPen } from 'lucide-react';

// A simple debounce function
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };

  return debounced as (...args: Parameters<F>) => void;
}


export function NotesWidget() {
  const { notesContent, setNotesContent, addLog } = useDashboardStore();
  const [localNotes, setLocalNotes] = useState(notesContent);

  const debouncedSetNotesContent = useCallback(
    debounce((content: string) => {
        setNotesContent(content);
        addLog({ message: 'Notes saved.', type: 'info' });
    }, 1000), 
    [setNotesContent, addLog]
  );
  
  useEffect(() => {
    setLocalNotes(notesContent);
  }, [notesContent]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = event.target.value;
    setLocalNotes(newContent);
    debouncedSetNotesContent(newContent);
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm h-full">
      <CardHeader>
        <div className="flex items-center gap-3">
            <NotebookPen className="h-6 w-6 text-muted-foreground" />
            <CardTitle>Scratchpad</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Jot down some notes..."
          className="h-48 resize-none"
          value={localNotes}
          onChange={handleChange}
        />
      </CardContent>
    </Card>
  );
}

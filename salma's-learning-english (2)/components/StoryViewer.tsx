import React, { useState, useEffect } from 'react';
import { Highlight, StoryData } from '../types';
import { Highlighter, StickyNote, Type } from 'lucide-react';

interface StoryViewerProps {
  story: StoryData;
  highlights: Highlight[];
  onAddHighlight: (text: string, color: Highlight['color']) => void;
  userNotes: string;
  onUpdateNotes: (notes: string) => void;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({ 
  story, 
  highlights, 
  onAddHighlight,
  userNotes,
  onUpdateNotes
}) => {
  const [selection, setSelection] = useState<{text: string, x: number, y: number} | null>(null);

  // Handle Text Selection
  const handleMouseUp = (e: React.MouseEvent) => {
    const windowSelection = window.getSelection();
    if (windowSelection && windowSelection.toString().trim().length > 0) {
      const text = windowSelection.toString();
      // Calculate position for popover
      const rect = windowSelection.getRangeAt(0).getBoundingClientRect();
      // Relative to the container
      setSelection({
        text,
        x: rect.left + (rect.width / 2),
        y: rect.top - 10
      });
    } else {
      setSelection(null);
    }
  };

  const handleHighlight = (color: Highlight['color']) => {
    if (selection) {
      onAddHighlight(selection.text, color);
      setSelection(null);
      // Clear native selection
      window.getSelection()?.removeAllRanges();
    }
  };

  // Simple string replacer for highlighting
  // Note: This is a basic implementation. It highlights ALL occurrences of the phrase.
  // For a robust app, we'd use index-based ranges, but string matching is safer for this demo scope.
  const renderContent = () => {
    let content = story.content;
    const parts: React.ReactNode[] = [];
    
    // Split by newlines for paragraphs first
    const paragraphs = content.split('\n');

    return paragraphs.map((para, pIdx) => {
      // For each paragraph, we need to apply highlights
      // We will assume highlights don't overlap for simplicity in this demo
      if (!para.trim()) return <br key={pIdx} />;

      let paraParts: React.ReactNode[] = [para];
      
      highlights.forEach(h => {
        const newParts: React.ReactNode[] = [];
        paraParts.forEach(part => {
          if (typeof part === 'string') {
            const split = part.split(h.text);
            split.forEach((s, sIdx) => {
              newParts.push(s);
              if (sIdx < split.length - 1) {
                newParts.push(
                  <span key={`${h.id}-${sIdx}`} className={`
                    ${h.color === 'yellow' ? 'bg-yellow-200' : ''}
                    ${h.color === 'green' ? 'bg-green-200' : ''}
                    ${h.color === 'pink' ? 'bg-pink-200' : ''}
                    rounded px-0.5 cursor-pointer hover:opacity-80
                  `}>
                    {h.text}
                  </span>
                );
              }
            });
          } else {
            newParts.push(part);
          }
        });
        paraParts = newParts;
      });

      return (
        <p key={pIdx} className="mb-4 text-lg leading-relaxed text-gray-800 font-serif">
          {paraParts}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Toolbar */}
      <div className="bg-pink-50 border-b border-pink-100 px-4 py-2 flex items-center justify-between">
        <h3 className="font-bold text-gray-700 font-serif truncate max-w-[200px]">{story.title}</h3>
        <div className="flex space-x-2 text-xs text-gray-500">
           <span className="flex items-center"><Highlighter className="w-3 h-3 mr-1"/> Select text to highlight</span>
        </div>
      </div>

      {/* Content Area */}
      <div 
        className="flex-1 overflow-y-auto p-6 custom-scrollbar relative"
        onMouseUp={handleMouseUp}
      >
        {renderContent()}

        {/* Floating Highlight Menu */}
        {selection && (
          <div 
            className="fixed z-50 bg-gray-800 text-white rounded-lg shadow-xl p-2 flex gap-2 -translate-x-1/2 -translate-y-full transform"
            style={{ left: selection.x, top: selection.y }}
          >
            <button onClick={() => handleHighlight('yellow')} className="w-6 h-6 rounded-full bg-yellow-400 hover:scale-110 transition-transform" />
            <button onClick={() => handleHighlight('green')} className="w-6 h-6 rounded-full bg-green-400 hover:scale-110 transition-transform" />
            <button onClick={() => handleHighlight('pink')} className="w-6 h-6 rounded-full bg-pink-400 hover:scale-110 transition-transform" />
          </div>
        )}
      </div>

      {/* Personal Notes Section */}
      <div className="border-t border-gray-100 bg-pink-50 p-4">
        <div className="flex items-center mb-2 text-indigo-900 font-semibold text-sm">
          <StickyNote className="w-4 h-4 mr-2" />
          My Notes & Vocabulary
        </div>
        <textarea 
          className="w-full h-24 p-3 rounded-lg border border-pink-200 text-sm focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 resize-none font-serif bg-white"
          placeholder="Type here to save new words or ideas..."
          value={userNotes}
          onChange={(e) => onUpdateNotes(e.target.value)}
        />
      </div>
    </div>
  );
};

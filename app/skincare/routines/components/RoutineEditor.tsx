'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, ChevronUp, ChevronDown, Plus, Check } from 'lucide-react';
import { upsertRoutine } from '../actions';

type RoutineStep = {
    id: string;
    order: number;
    text: string;
};

interface RoutineEditorProps {
    dayOfWeek: number;
    timeOfDay: 'morning' | 'night';
    initialSteps: RoutineStep[];
}

export default function RoutineEditor({ dayOfWeek, timeOfDay, initialSteps }: RoutineEditorProps) {
    const [steps, setSteps] = useState<RoutineStep[]>(initialSteps);
    const [newStepText, setNewStepText] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const title = timeOfDay === 'morning' ? 'Morning Routine' : 'Night Routine';

    const handleAddStep = () => {
        if (!newStepText.trim()) return;

        const maxOrder = steps.length > 0 ? Math.max(...steps.map((s) => s.order)) : 0;
        const newStep: RoutineStep = {
            id: crypto.randomUUID(),
            order: maxOrder + 1,
            text: newStepText.trim(),
        };

        setSteps([...steps, newStep]);
        setNewStepText('');
        setHasChanges(true);
    };

    const handleDeleteStep = (id: string) => {
        const updatedSteps = steps
            .filter((s) => s.id !== id)
            .map((s, index) => ({ ...s, order: index + 1 })); // Renumber
        setSteps(updatedSteps);
        setHasChanges(true);
    };

    const handleStartEdit = (step: RoutineStep) => {
        setEditingId(step.id);
        setEditText(step.text);
    };

    const handleSaveEdit = () => {
        if (!editingId || !editText.trim()) {
            setEditingId(null);
            return;
        }

        const updatedSteps = steps.map((s) =>
            s.id === editingId ? { ...s, text: editText.trim() } : s
        );
        setSteps(updatedSteps);
        setEditingId(null);
        setEditText('');
        setHasChanges(true);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditText('');
    };

    const handleMoveUp = (index: number) => {
        if (index === 0) return;

        const updatedSteps = [...steps];
        const temp = updatedSteps[index];
        updatedSteps[index] = updatedSteps[index - 1];
        updatedSteps[index - 1] = temp;

        // Update order numbers
        updatedSteps[index].order = index + 1;
        updatedSteps[index - 1].order = index;

        setSteps(updatedSteps);
        setHasChanges(true);
    };

    const handleMoveDown = (index: number) => {
        if (index === steps.length - 1) return;

        const updatedSteps = [...steps];
        const temp = updatedSteps[index];
        updatedSteps[index] = updatedSteps[index + 1];
        updatedSteps[index + 1] = temp;

        // Update order numbers
        updatedSteps[index].order = index + 1;
        updatedSteps[index + 1].order = index + 2;

        setSteps(updatedSteps);
        setHasChanges(true);
    };

    const handleSaveRoutine = async () => {
        setSaving(true);
        try {
            await upsertRoutine(dayOfWeek, timeOfDay, steps);
            setHasChanges(false);
        } catch (error) {
            console.error('Failed to save routine:', error);
            alert('Failed to save routine. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">{title}</h2>

            {/* Steps List */}
            <div className="space-y-2 mb-4">
                {steps.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No steps yet. Add your first step below.</p>
                ) : (
                    steps.map((step, index) => (
                        <div key={step.id} className="flex items-center gap-2 p-2 rounded border bg-card">
                            {/* Order Number */}
                            <span className="text-sm font-medium text-muted-foreground w-6">{step.order}</span>

                            {/* Step Text or Edit Input */}
                            {editingId === step.id ? (
                                <div className="flex-1 flex items-center gap-2">
                                    <Input
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSaveEdit();
                                            if (e.key === 'Escape') handleCancelEdit();
                                        }}
                                        autoFocus
                                        className="flex-1"
                                    />
                                    <Button size="sm" variant="ghost" onClick={handleSaveEdit}>
                                        <Check className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <button
                                        onClick={() => handleStartEdit(step)}
                                        className="flex-1 text-left text-sm hover:text-primary transition-colors"
                                    >
                                        {step.text}
                                    </button>

                                    {/* Reorder Buttons */}
                                    <div className="flex gap-1">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleMoveUp(index)}
                                            disabled={index === 0}
                                        >
                                            <ChevronUp className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleMoveDown(index)}
                                            disabled={index === steps.length - 1}
                                        >
                                            <ChevronDown className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {/* Delete Button */}
                                    <Button size="sm" variant="ghost" onClick={() => handleDeleteStep(step.id)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Add Step Input */}
            <div className="flex gap-2 mb-4">
                <Input
                    placeholder="Add a new step..."
                    value={newStepText}
                    onChange={(e) => setNewStepText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddStep();
                    }}
                />
                <Button onClick={handleAddStep} disabled={!newStepText.trim()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Step
                </Button>
            </div>

            {/* Save Button */}
            <Button
                onClick={handleSaveRoutine}
                disabled={!hasChanges || saving}
                className="w-full"
                variant="default"
            >
                {saving ? 'Saving...' : 'Save Routine'}
            </Button>
        </Card>
    );
}

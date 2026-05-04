"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Star, Pencil, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsListItemProps {
  value: string;
  onUpdate: (oldValue: string, newValue: string) => void;
  onDelete: (value: string) => void;
  isPreset?: boolean;
  onTogglePreset?: (value: string) => void;
  isLoading?: boolean;
}

export function SettingsListItem({
  value,
  onUpdate,
  onDelete,
  isPreset,
  onTogglePreset,
  isLoading
}: SettingsListItemProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedValue, setEditedValue] = React.useState(value);

  React.useEffect(() => {
    setEditedValue(value);
  }, [value]);

  const handleSave = () => {
    if (editedValue.trim() && editedValue !== value) {
      onUpdate(value, editedValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center justify-between p-2 bg-bg dark:bg-darkBg border">
        <Input
          value={editedValue}
          onChange={(e) => setEditedValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-8 text-sm mr-2"
          autoFocus
        />
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-text dark:text-darkText hover:bg-green-100 hover:text-green-600 dark:hover:bg-green-900/30 dark:hover:text-green-400"
            onClick={handleSave}
            disabled={isLoading}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-text dark:text-darkText hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
            onClick={handleCancel}
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-2 bg-bg dark:bg-darkBg border group">
      <span className="text-sm truncate mr-2">{value}</span>
      <div className="flex items-center gap-1 shrink-0">
        {onTogglePreset && (
          <Button
            className="h-8 w-8 hover:bg-transparent"
            variant="ghost"
            size="icon"
            onClick={() => onTogglePreset(value)}
            title="Toggle Preset"
          >
            <Star
              className={cn(
                "h-4 w-4 transition-colors",
                isPreset ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
              )}
            />
          </Button>
        )}
        <Button
          className="h-8 w-8 text-text dark:text-darkText hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
          variant="ghost"
          size="icon"
          onClick={() => setIsEditing(true)}
          title="Edit"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          className="h-8 w-8 text-text dark:text-darkText hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
          variant="ghost"
          size="icon"
          onClick={() => onDelete(value)}
          title="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

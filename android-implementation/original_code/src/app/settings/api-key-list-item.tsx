"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Trash2, Copy, Check, Key } from "lucide-react";
import { ApiKey, ApiKeyPrivileges } from "@/hooks/use-api-keys";

interface ApiKeyListItemProps {
  apiKey: ApiKey;
  onDelete: (id: string) => void;
  onUpdatePrivileges: (id: string, privileges: ApiKeyPrivileges) => void;
}

export function ApiKeyListItem({ apiKey, onDelete, onUpdatePrivileges }: ApiKeyListItemProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey.key_prefix + "...");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrivilegeChange = (type: keyof ApiKeyPrivileges, checked: boolean) => {
    onUpdatePrivileges(apiKey.id, {
      ...apiKey.privileges,
      [type]: checked,
    });
  };

  return (
    <Card className="bg-secondaryBg dark:bg-secondaryBlack border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <Key className="h-4 w-4" />
            {apiKey.name}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(apiKey.id)}
            className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 bg-main/10 dark:bg-main/20 p-2 border-2 border-black dark:border-white rounded">
          <code className="flex-1 text-sm font-mono truncate">
            {apiKey.key_prefix}**************************
          </code>
          {/* <Button variant="ghost" size="icon" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button> */}
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`read-${apiKey.id}`}
              checked={apiKey.privileges.read}
              onCheckedChange={(checked) => handlePrivilegeChange("read", !!checked)}
            />
            <Label htmlFor={`read-${apiKey.id}`} className="text-sm">READ</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`create-${apiKey.id}`}
              checked={apiKey.privileges.create}
              onCheckedChange={(checked) => handlePrivilegeChange("create", !!checked)}
            />
            <Label htmlFor={`create-${apiKey.id}`} className="text-sm">CREATE</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`update-${apiKey.id}`}
              checked={apiKey.privileges.update}
              onCheckedChange={(checked) => handlePrivilegeChange("update", !!checked)}
            />
            <Label htmlFor={`update-${apiKey.id}`} className="text-sm">UPDATE</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`delete-${apiKey.id}`}
              checked={apiKey.privileges.delete}
              onCheckedChange={(checked) => handlePrivilegeChange("delete", !!checked)}
            />
            <Label htmlFor={`delete-${apiKey.id}`} className="text-sm">DELETE</Label>
          </div>
        </div>
        
        <div className="text-[10px] text-gray-500 flex justify-between pt-2">
          <span>Created: {new Date(apiKey.created_at).toLocaleDateString()}</span>
          <span>Last used: {apiKey.last_used_at ? new Date(apiKey.last_used_at).toLocaleDateString() : "Never"}</span>
        </div>
      </CardContent>
    </Card>
  );
}

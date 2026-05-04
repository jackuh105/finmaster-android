"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUserSettings } from "@/hooks/use-user-settings";
import { Trash2, Plus, Settings, List, Wallet, Tag, Star, AlertTriangle, Key, Copy, Check, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCategories } from "@/hooks/use-categories";
import { useAccounts } from "@/hooks/use-accounts";
import { useItemTags } from "@/hooks/use-item-tags";
import { useApiKeys } from "@/hooks/use-api-keys";

import { SettingsListItem } from "./settings-list-item";
import { ApiKeyListItem } from "./api-key-list-item";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function SettingsPage() {
  const {
    itemTags,
    addItemTag,
    deleteItemTag,
    updateItemTag
  } = useItemTags();
  const { budget, updateBudget } = useUserSettings();

  const {
    categories,
    addCategory,
    deleteCategory,
    updateCategory,
    togglePreset: toggleCategoryPreset
  } = useCategories();

  const {
    accounts: accountsData,
    addAccount: addAccountApi,
    deleteAccount: deleteAccountApi,
    updateAccount: updateAccountApi,
    togglePreset: toggleAccountPresetApi
  } = useAccounts();

  const {
    apiKeys,
    createApiKey,
    deleteApiKey,
    updateApiKeyPrivileges
  } = useApiKeys();

  const [activeTab, setActiveTab] = React.useState("general");
  const [newKeyDialog, setNewKeyDialog] = React.useState<{ open: boolean, key: string | null }>({ open: false, key: null });
  const [copied, setCopied] = React.useState(false);

  // Local states for inputs
  const [inputs, setInputs] = React.useState({
    itemTag: "",
    type: "",           // for adding to Types list
    typePreset: "",     // for adding to Presets
    account: "",        // for adding to Accounts list
    accountPreset: "",  // for adding to Presets
    budget: budget?.toString() ?? "",
    apiKeyName: "",
  });

  const [apiKeyPrivileges, setApiKeyPrivileges] = React.useState({
    read: true,
    create: false,
    update: false,
    delete: false,
  });

  React.useEffect(() => {
    setInputs(prev => ({ ...prev, budget: budget?.toString() ?? "" }));
  }, [budget]);

  const handleInputChange = (field: keyof typeof inputs, value: string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdateBudget = () => {
    const val = parseFloat(inputs.budget);
    if (!isNaN(val) && val > 0) {
      updateBudget(val);
      alert("Budget updated!");
    } else {
      alert("Please enter a valid budget amount.");
    }
  };

  const renderSidebarItem = (id: string, label: string, icon: React.ReactNode) => (
    <button
      onClick={() => setActiveTab(id)}
      className={cn(
        "flex items-center gap-3 px-4 py-3 text-sm font-medium w-full text-left transition-colors",
        activeTab === id
          ? "bg-main text-white dark:text-black"
          : "hover:bg-secondaryBg dark:hover:bg-secondaryBlack text-text dark:text-darkText"
      )}
    >
      {icon}
      {label}
    </button>
  );

  const renderListSection = (
    title: string,
    items: string[],
    onAdd: (val: string) => void,
    onDelete: (val: string) => void,
    inputValue: string,
    inputKey: keyof typeof inputs,
    placeholder: string,
    max?: number,
    presets?: string[],
    onTogglePreset?: (val: string) => void,
    maxPresets?: number,
    onUpdate?: (oldVal: string, newVal: string) => void
  ) => (
    <Card className="bg-secondaryBg dark:bg-secondaryBlack text-text dark:text-darkText">
      <CardHeader>
        <CardTitle>{title} {max ? `(Max ${max})` : ""}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => handleInputChange(inputKey, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && inputValue.trim()) {
                if (max && items.length >= max) {
                  alert(`Maximum ${max} items allowed`);
                  return;
                }
                onAdd(inputValue.trim());
                handleInputChange(inputKey, "");
              }
            }}
          />
          <Button size="icon" onClick={() => {
            if (inputValue.trim()) {
              if (max && items.length >= max) {
                alert(`Maximum ${max} items allowed`);
                return;
              }
              onAdd(inputValue.trim());
              handleInputChange(inputKey, "");
            }
          }}><Plus className="h-4 w-4" /></Button>
        </div>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {items.map((item) => (
            <SettingsListItem
              key={item}
              value={item}
              onDelete={onDelete}
              onUpdate={onUpdate || ((o, n) => { })}
              isPreset={presets?.includes(item)}
              onTogglePreset={onTogglePreset}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const handleToggle = (
    item: string,
    currentPresets: string[],
    limit: number,
    mutator: (args: { name: string; is_preset: boolean }) => void
  ) => {
    // Logic for toggling presets
    if (currentPresets.includes(item)) {
      mutator({ name: item, is_preset: false });
    } else {
      if (currentPresets.length >= limit) {
        alert(`Maximum ${limit} presets allowed`);
        return;
      }
      mutator({ name: item, is_preset: true });
    }
  }

  // Derived data for display
  const displayTypes = categories?.map((c: any) => c.name) || [];
  const displayTypePresets = categories?.filter((c: any) => c.is_preset).map((c: any) => c.name) || [];

  const handleAddType = (type: string) => {
    if (displayTypes.includes(type)) return;
    addCategory({ name: type, is_preset: false });
  }

  const handleDeleteType = (type: string) => {
    deleteCategory(type);
  }

  const handleUpdateType = (oldName: string, newName: string) => {
    if (displayTypes.includes(newName)) {
      alert("Type already exists");
      return;
    }
    updateCategory({ oldName, newName });
  }

  const displayAccounts = accountsData?.map((a: any) => a.name) || [];
  const displayAccountPresets = accountsData?.filter((a: any) => a.is_preset).map((a: any) => a.name) || [];

  const handleAddAccount = (account: string) => {
    if (displayAccounts.includes(account)) return;
    addAccountApi({ name: account, is_preset: false });
  }

  const handleDeleteAccount = (account: string) => {
    deleteAccountApi(account);
  }

  const handleUpdateAccount = (oldName: string, newName: string) => {
    if (displayAccounts.includes(newName)) {
      alert("Account already exists");
      return;
    }
    updateAccountApi({ oldName, newName });
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full max-w-6xl pt-8 px-4 h-[calc(100vh-80px)]">
      {/* Sidebar */}
      <div className="w-full md:w-64 shrink-0">
        <Card className="bg-secondaryBg dark:bg-secondaryBlack p-4 flex flex-col gap-2 text-text dark:text-darkText">
          <h2 className="text-xl font-bold mb-4 px-2">Settings</h2>
          {renderSidebarItem("general", "General", <Settings className="h-4 w-4" />)}
          {renderSidebarItem("items", "Item Presets", <Tag className="h-4 w-4" />)}
          {renderSidebarItem("types", "Transaction Types", <List className="h-4 w-4" />)}
          {renderSidebarItem("accounts", "Accounts", <Wallet className="h-4 w-4" />)}
          {renderSidebarItem("api-keys", "API Keys", <Key className="h-4 w-4" />)}
        </Card>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pb-10">
        {activeTab === "general" && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold">General Settings</h3>
            <Card className="bg-secondaryBg dark:bg-secondaryBlack text-text dark:text-darkText">
              <CardHeader>
                <CardTitle>Budget Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {budget === null && (
                  <div className="flex items-center gap-2 p-3 mb-4 bg-yellow-200 border-2 border-black text-black">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-bold">You haven&apos;t set a monthly budget yet.</span>
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-1 block">Monthly Budget</label>
                    <Input
                      type="number"
                      value={inputs.budget}
                      onChange={(e) => handleInputChange("budget", e.target.value)}
                    />
                  </div>
                  <Button className="mt-6" onClick={handleUpdateBudget}>Save</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "items" && (
          <div className="space-y-6">
            {renderListSection(
              "Item Name Presets",
              itemTags,
              addItemTag,
              deleteItemTag,
              inputs.itemTag,
              "itemTag",
              "New item preset...",
              8,
              undefined,
              undefined,
              undefined,
              (oldTag, newTag) => {
                if (itemTags.includes(newTag)) {
                  alert("Tag already exists");
                  return;
                }
                updateItemTag({ oldTag, newTag });
              }
            )}
          </div>
        )}

        {activeTab === "types" && (
          <div className="space-y-6">
            {renderListSection(
              "Transaction Types",
              displayTypes,
              handleAddType,
              handleDeleteType,
              inputs.type,
              "type",
              "New type...",
              undefined,
              displayTypePresets,
              (val) => handleToggle(val, displayTypePresets, 5, toggleCategoryPreset),
              5,
              handleUpdateType
            )}
          </div>
        )}

        {activeTab === "accounts" && (
          <div className="space-y-6">
            {renderListSection(
              "Accounts",
              displayAccounts,
              handleAddAccount,
              handleDeleteAccount,
              inputs.account,
              "account",
              "New account...",
              undefined,
              displayAccountPresets,
              (val) => handleToggle(val, displayAccountPresets, 5, toggleAccountPresetApi),
              5,
              handleUpdateAccount
            )}
          </div>
        )}

        {activeTab === "api-keys" && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold">API Keys</h3>
            <Card className="bg-secondaryBg dark:bg-secondaryBlack text-text dark:text-darkText">
              <CardHeader>
                <CardTitle>Create New API Key (Max 5)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="API Key Name (e.g. My AI Assistant)"
                      value={inputs.apiKeyName}
                      onChange={(e) => handleInputChange("apiKeyName", e.target.value)}
                      disabled={apiKeys.length >= 5}
                    />
                    <Button 
                      onClick={async () => {
                        if (inputs.apiKeyName.trim()) {
                          const res = await createApiKey({ 
                            name: inputs.apiKeyName.trim(), 
                            privileges: apiKeyPrivileges 
                          });
                          setNewKeyDialog({ open: true, key: res.rawKey });
                          handleInputChange("apiKeyName", "");
                        }
                      }}
                      disabled={!inputs.apiKeyName.trim() || apiKeys.length >= 5}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Generate Key
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="new-read" 
                        checked={apiKeyPrivileges.read} 
                        onCheckedChange={(c) => setApiKeyPrivileges(prev => ({ ...prev, read: !!c }))}
                      />
                      <Label htmlFor="new-read">READ</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="new-create" 
                        checked={apiKeyPrivileges.create} 
                        onCheckedChange={(c) => setApiKeyPrivileges(prev => ({ ...prev, create: !!c }))}
                      />
                      <Label htmlFor="new-create">CREATE</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="new-update" 
                        checked={apiKeyPrivileges.update} 
                        onCheckedChange={(c) => setApiKeyPrivileges(prev => ({ ...prev, update: !!c }))}
                      />
                      <Label htmlFor="new-update">UPDATE</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="new-delete" 
                        checked={apiKeyPrivileges.delete} 
                        onCheckedChange={(c) => setApiKeyPrivileges(prev => ({ ...prev, delete: !!c }))}
                      />
                      <Label htmlFor="new-delete">DELETE</Label>
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <h4 className="font-bold flex items-center gap-2">
                    Your Keys ({apiKeys.length}/5)
                  </h4>
                  {apiKeys.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg text-gray-400">
                      No API keys generated yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {apiKeys.map((key) => (
                        <ApiKeyListItem
                          key={key.id}
                          apiKey={key}
                          onDelete={deleteApiKey}
                          onUpdatePrivileges={(id, privileges) => updateApiKeyPrivileges({ id, privileges })}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Dialog open={newKeyDialog.open} onOpenChange={(open) => !open && setNewKeyDialog({ open: false, key: null })}>
              <DialogContent className="bg-main text-white dark:text-black border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black">API Key Generated!</DialogTitle>
                  <DialogDescription className="text-white/90 dark:text-black/90 font-bold">
                    Please copy this key now. For your security, it will not be shown again.
                  </DialogDescription>
                </DialogHeader>
                <div className="bg-white dark:bg-black p-4 border-4 border-black rounded-none my-4">
                  <div className="flex items-center gap-2">
                    <code className="flex-1 font-mono text-black dark:text-white break-all">
                      {newKeyDialog.key}
                    </code>
                    <Button 
                      variant="ghost" 
                      className="hover:bg-gray-200 dark:hover:bg-gray-800"
                      onClick={() => {
                        if (newKeyDialog.key) {
                          navigator.clipboard.writeText(newKeyDialog.key);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }
                      }}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-yellow-300 p-3 border-2 border-black text-black text-sm">
                  <Info className="h-5 w-5 shrink-0" />
                  <p className="font-bold">
                    This key grants access to your financial data. Keep it secret!
                  </p>
                </div>
                <DialogFooter>
                  <Button 
                    className="bg-black text-white hover:bg-gray-800 border-2 border-black"
                    onClick={() => setNewKeyDialog({ open: false, key: null })}
                  >
                    I have saved it
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { Key, Copy, Trash2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ResponsiveCard } from '@/components/ui/responsive-card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { API_PERMISSIONS } from '@/lib/api/api-key-manager';
import { cn } from '@/lib/utils';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  lastUsedAt?: string;
  expiresAt?: string;
  createdAt: string;
}

export default function ApiKeysPage() {
  const t = useTranslations();
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showKey, setShowKey] = useState<string | null>(null);
  const [newKeyData, setNewKeyData] = useState({
    name: '',
    permissions: [] as string[],
    expiresIn: '0',
  });
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/v1/api-keys');
      if (!response.ok) throw new Error('Failed to fetch API keys');
      const data = await response.json();
      setApiKeys(data.apiKeys);
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Failed to load API keys',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async () => {
    try {
      const response = await fetch('/api/v1/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newKeyData,
          expiresIn: newKeyData.expiresIn === '0' ? undefined : parseInt(newKeyData.expiresIn),
        }),
      });

      if (!response.ok) throw new Error('Failed to create API key');

      const data = await response.json();
      setCreatedKey(data.apiKey.key);

      toast({
        title: t('common.success'),
        description: 'API key created successfully',
      });

      // Reset form
      setNewKeyData({ name: '', permissions: [], expiresIn: '0' });

      // Refresh list
      fetchApiKeys();
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Failed to create API key',
        variant: 'destructive',
      });
    }
  };

  const deleteApiKey = async (keyId: string) => {
    try {
      const response = await fetch(`/api/v1/api-keys/${keyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete API key');

      toast({
        title: t('common.success'),
        description: 'API key deleted successfully',
      });

      // Refresh list
      fetchApiKeys();
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Failed to delete API key',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'API key copied to clipboard',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const permissionLabels: Record<string, string> = {
    [API_PERMISSIONS.READ_PORTFOLIO]: 'Read Portfolio',
    [API_PERMISSIONS.WRITE_PORTFOLIO]: 'Write Portfolio',
    [API_PERMISSIONS.READ_TRADES]: 'Read Trades',
    [API_PERMISSIONS.WRITE_TRADES]: 'Write Trades',
    [API_PERMISSIONS.READ_ANALYTICS]: 'Read Analytics',
    [API_PERMISSIONS.READ_MARKET_DATA]: 'Read Market Data',
    [API_PERMISSIONS.ADMIN]: 'Full Access',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">API Keys</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your API keys for programmatic access
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Key className="w-4 h-4 mr-2" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
              <DialogDescription>
                Create a new API key for programmatic access to your account
              </DialogDescription>
            </DialogHeader>

            {createdKey ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-900 dark:text-green-100">
                        API Key Created Successfully
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        Save this key securely. You won't be able to see it again.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Your API Key</Label>
                  <div className="flex gap-2">
                    <Input value={createdKey} readOnly className="font-mono text-sm" />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => copyToClipboard(createdKey)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      setCreatedKey(null);
                    }}
                  >
                    Done
                  </Button>
                </DialogFooter>
              </div>
            ) : (
              <>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Key Name</Label>
                    <Input
                      id="name"
                      placeholder="My API Key"
                      value={newKeyData.name}
                      onChange={(e) => setNewKeyData({ ...newKeyData, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expires">Expiration</Label>
                    <Select
                      value={newKeyData.expiresIn}
                      onValueChange={(value) => setNewKeyData({ ...newKeyData, expiresIn: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Never expires</SelectItem>
                        <SelectItem value="24">24 hours</SelectItem>
                        <SelectItem value="168">7 days</SelectItem>
                        <SelectItem value="720">30 days</SelectItem>
                        <SelectItem value="2160">90 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Permissions</Label>
                    <div className="space-y-2">
                      {Object.entries(permissionLabels).map(([permission, label]) => (
                        <div key={permission} className="flex items-center space-x-2">
                          <Checkbox
                            id={permission}
                            checked={newKeyData.permissions.includes(permission)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setNewKeyData({
                                  ...newKeyData,
                                  permissions: [...newKeyData.permissions, permission],
                                });
                              } else {
                                setNewKeyData({
                                  ...newKeyData,
                                  permissions: newKeyData.permissions.filter(
                                    (p) => p !== permission,
                                  ),
                                });
                              }
                            }}
                          />
                          <Label
                            htmlFor={permission}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={createApiKey}
                    disabled={!newKeyData.name || newKeyData.permissions.length === 0}
                  >
                    Create Key
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : apiKeys.length === 0 ? (
        <ResponsiveCard className="text-center py-12">
          <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No API Keys</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Create your first API key to get started
          </p>
        </ResponsiveCard>
      ) : (
        <div className="space-y-4">
          {apiKeys.map((apiKey) => (
            <ResponsiveCard key={apiKey.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">{apiKey.name}</h3>
                  <div className="mt-1 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <p>Created: {formatDate(apiKey.createdAt)}</p>
                    {apiKey.lastUsedAt && <p>Last used: {formatDate(apiKey.lastUsedAt)}</p>}
                    {apiKey.expiresAt && (
                      <p className="text-amber-600 dark:text-amber-400">
                        Expires: {formatDate(apiKey.expiresAt)}
                      </p>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {apiKey.permissions.map((permission) => (
                      <span
                        key={permission}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        {permissionLabels[permission] || permission}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setShowKey(showKey === apiKey.id ? null : apiKey.id)}
                  >
                    {showKey === apiKey.id ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    onClick={() => deleteApiKey(apiKey.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {showKey === apiKey.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Input value={apiKey.key} readOnly className="font-mono text-sm" />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => copyToClipboard(apiKey.key)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </ResponsiveCard>
          ))}
        </div>
      )}

      <ResponsiveCard
        variant="compact"
        className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
      >
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800 dark:text-amber-200">
            <p className="font-medium">Security Notice</p>
            <p className="mt-1">
              Keep your API keys secure and never share them publicly. Treat them like passwords. If
              you suspect a key has been compromised, delete it immediately.
            </p>
          </div>
        </div>
      </ResponsiveCard>
    </div>
  );
}

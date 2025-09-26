import React, { useState } from 'react'
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Bell, 
  Mail, 
  Shield, 
  Database,
  Zap,
  Globe,
  DollarSign,
  Clock,
  AlertTriangle,
  Check
} from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Switch } from '../ui/switch'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Textarea } from '../ui/textarea'
import { Separator } from '../ui/separator'
import { Badge } from '../ui/badge'
import { toast } from 'sonner'

export const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    // General Settings
    systemName: 'UtilityPro',
    systemVersion: '2.1.0',
    maintenanceMode: false,
    defaultLanguage: 'en',
    timezone: 'Europe/Tirane',
    dateFormat: 'DD/MM/YYYY',
    
    // Billing Settings
    defaultCurrency: 'EUR',
    taxRate: 20,
    lateFeePercentage: 5,
    paymentGracePeriod: 7,
    invoicePrefix: 'INV',
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    notificationRetries: 3,
    
    // Security Settings
    sessionTimeout: 60,
    passwordExpiry: 90,
    maxLoginAttempts: 5,
    twoFactorRequired: false,
    
    // Integration Settings
    erpNextUrl: 'https://erp.example.com',
    erpNextApiKey: 'api_key_placeholder',
    paymentGateway: 'stripe',
    backupFrequency: 'daily'
  })

  const handleSave = (section: string) => {
    toast.success(`${section} settings saved successfully`)
  }

  const handleTestConnection = (service: string) => {
    toast.success(`${service} connection test successful`)
  }

  const timezones = [
    'Europe/Tirane',
    'Europe/London', 
    'Europe/Berlin',
    'America/New_York',
    'America/Los_Angeles'
  ]

  const currencies = ['EUR', 'USD', 'ALL', 'GBP']
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'sq', name: 'Albanian' }
  ]

  const paymentGateways = [
    { value: 'stripe', label: 'Stripe' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'razorpay', label: 'RazorPay' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">System Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure system-wide settings and preferences
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
        </div>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-lime-500 rounded-full"></div>
              <span className="text-sm">System Online</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-lime-500 rounded-full"></div>
              <span className="text-sm">Database Connected</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-lime-500 rounded-full"></div>
              <span className="text-sm">ERPNext Connected</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">Backup Pending</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600">System Name</label>
                  <Input
                    value={settings.systemName}
                    onChange={(e) => setSettings({...settings, systemName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">System Version</label>
                  <Input
                    value={settings.systemVersion}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Default Language</label>
                  <Select 
                    value={settings.defaultLanguage} 
                    onValueChange={(value) => setSettings({...settings, defaultLanguage: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Timezone</label>
                  <Select 
                    value={settings.timezone} 
                    onValueChange={(value) => setSettings({...settings, timezone: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Date Format</label>
                  <Select 
                    value={settings.dateFormat} 
                    onValueChange={(value) => setSettings({...settings, dateFormat: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Maintenance Mode</h4>
                  <p className="text-sm text-gray-500">
                    Enable maintenance mode to restrict user access
                  </p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings({...settings, maintenanceMode: checked})}
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave('General')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save General Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Settings */}
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600">Default Currency</label>
                  <Select 
                    value={settings.defaultCurrency} 
                    onValueChange={(value) => setSettings({...settings, defaultCurrency: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Tax Rate (%)</label>
                  <Input
                    type="number"
                    value={settings.taxRate}
                    onChange={(e) => setSettings({...settings, taxRate: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Late Fee (%)</label>
                  <Input
                    type="number"
                    value={settings.lateFeePercentage}
                    onChange={(e) => setSettings({...settings, lateFeePercentage: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Payment Grace Period (days)</label>
                  <Input
                    type="number"
                    value={settings.paymentGracePeriod}
                    onChange={(e) => setSettings({...settings, paymentGracePeriod: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Invoice Prefix</label>
                  <Input
                    value={settings.invoicePrefix}
                    onChange={(e) => setSettings({...settings, invoicePrefix: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave('Billing')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Billing Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-gray-500">Send notifications via email</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-5 w-5 text-gray-400" />
                    <div>
                      <h4 className="font-medium">Push Notifications</h4>
                      <p className="text-sm text-gray-500">Send browser push notifications</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => setSettings({...settings, pushNotifications: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                      SMS
                    </Badge>
                    <div>
                      <h4 className="font-medium">SMS Notifications</h4>
                      <p className="text-sm text-gray-500">Send notifications via SMS</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => setSettings({...settings, smsNotifications: checked})}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <label className="text-sm font-medium text-gray-600">Notification Retry Attempts</label>
                <Input
                  type="number"
                  value={settings.notificationRetries}
                  onChange={(e) => setSettings({...settings, notificationRetries: Number(e.target.value)})}
                  className="w-32"
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave('Notification')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Notification Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600">Session Timeout (minutes)</label>
                  <Input
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings({...settings, sessionTimeout: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Password Expiry (days)</label>
                  <Input
                    type="number"
                    value={settings.passwordExpiry}
                    onChange={(e) => setSettings({...settings, passwordExpiry: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Max Login Attempts</label>
                  <Input
                    type="number"
                    value={settings.maxLoginAttempts}
                    onChange={(e) => setSettings({...settings, maxLoginAttempts: Number(e.target.value)})}
                  />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-500">
                    Require 2FA for all admin users
                  </p>
                </div>
                <Switch
                  checked={settings.twoFactorRequired}
                  onCheckedChange={(checked) => setSettings({...settings, twoFactorRequired: checked})}
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave('Security')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Security Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integration Settings */}
        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integration Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* ERPNext Integration */}
              <div>
                <h4 className="font-medium mb-4">ERPNext Integration</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">ERPNext URL</label>
                    <Input
                      value={settings.erpNextUrl}
                      onChange={(e) => setSettings({...settings, erpNextUrl: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">API Key</label>
                    <Input
                      type="password"
                      value={settings.erpNextApiKey}
                      onChange={(e) => setSettings({...settings, erpNextApiKey: e.target.value})}
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => handleTestConnection('ERPNext')}
                  >
                    Test Connection
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Payment Gateway */}
              <div>
                <h4 className="font-medium mb-4">Payment Gateway</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Payment Provider</label>
                    <Select 
                      value={settings.paymentGateway} 
                      onValueChange={(value) => setSettings({...settings, paymentGateway: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentGateways.map((gateway) => (
                          <SelectItem key={gateway.value} value={gateway.value}>
                            {gateway.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => handleTestConnection('Payment Gateway')}
                  >
                    Test Connection
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Backup Settings */}
              <div>
                <h4 className="font-medium mb-4">Backup Configuration</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Backup Frequency</label>
                    <Select 
                      value={settings.backupFrequency} 
                      onValueChange={(value) => setSettings({...settings, backupFrequency: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline">
                    <Database className="h-4 w-4 mr-2" />
                    Run Backup Now
                  </Button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave('Integration')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Integration Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
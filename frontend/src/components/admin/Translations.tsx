import React, { useState } from 'react'
import { 
  Globe, 
  Plus, 
  Edit, 
  Save, 
  X, 
  Search,
  Filter,
  Download,
  Upload,
  Languages,
  Check
} from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { Textarea } from '../ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { toast } from 'sonner'

// Mock translation data
const mockTranslations = [
  {
    id: '1',
    key: 'dashboard.welcome',
    category: 'dashboard',
    english: 'Welcome to your dashboard',
    albanian: 'Mirë se erdhe në panelin tënd',
    status: 'completed',
    lastUpdated: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    key: 'navigation.invoices',
    category: 'navigation',
    english: 'Invoices',
    albanian: 'Faturat',
    status: 'completed',
    lastUpdated: '2024-01-14T14:20:00Z'
  },
  {
    id: '3',
    key: 'auth.login',
    category: 'authentication',
    english: 'Log In',
    albanian: 'Hyr',
    status: 'completed',
    lastUpdated: '2024-01-13T09:15:00Z'
  },
  {
    id: '4',
    key: 'payments.pending',
    category: 'payments',
    english: 'Payment Pending',
    albanian: '',
    status: 'pending',
    lastUpdated: '2024-01-12T16:45:00Z'
  },
  {
    id: '5',
    key: 'analytics.consumption',
    category: 'analytics',
    english: 'Consumption Analytics',
    albanian: 'Analitika e Konsumit',
    status: 'completed',
    lastUpdated: '2024-01-11T11:20:00Z'
  }
]

const categories = [
  'dashboard',
  'navigation', 
  'authentication',
  'payments',
  'analytics',
  'invoices',
  'profile'
]

export const Translations: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editingItem, setEditingItem] = useState<any>(null)
  const [newTranslation, setNewTranslation] = useState({
    key: '',
    category: '',
    english: '',
    albanian: ''
  })
  const [showAddDialog, setShowAddDialog] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleSaveEdit = () => {
    toast.success('Translation updated successfully')
    setEditingItem(null)
  }

  const handleAddTranslation = () => {
    toast.success('Translation added successfully')
    setNewTranslation({ key: '', category: '', english: '', albanian: '' })
    setShowAddDialog(false)
  }

  const filteredTranslations = mockTranslations.filter(translation => {
    const matchesSearch = 
      translation.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      translation.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
      translation.albanian.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === 'all' || translation.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || translation.status === statusFilter
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const stats = {
    total: mockTranslations.length,
    completed: mockTranslations.filter(t => t.status === 'completed').length,
    pending: mockTranslations.filter(t => t.status === 'pending').length,
    coverage: Math.round((mockTranslations.filter(t => t.status === 'completed').length / mockTranslations.length) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Translation Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage translations for Albanian and English languages
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Translation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Translation</DialogTitle>
                <DialogDescription>
                  Create a new translation entry for both languages
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Translation Key</label>
                  <Input
                    placeholder="e.g. dashboard.welcome"
                    value={newTranslation.key}
                    onChange={(e) => setNewTranslation({...newTranslation, key: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Category</label>
                  <Select 
                    value={newTranslation.category} 
                    onValueChange={(value) => setNewTranslation({...newTranslation, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">English Text</label>
                  <Textarea
                    placeholder="Enter English text"
                    value={newTranslation.english}
                    onChange={(e) => setNewTranslation({...newTranslation, english: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Albanian Text</label>
                  <Textarea
                    placeholder="Enter Albanian text"
                    value={newTranslation.albanian}
                    onChange={(e) => setNewTranslation({...newTranslation, albanian: e.target.value})}
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddTranslation}>
                    Add Translation
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Keys</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Languages className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <Check className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Edit className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Coverage</p>
                <p className="text-2xl font-bold text-blue-600">{stats.coverage}%</p>
              </div>
              <Globe className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search translations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Translations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Translation Keys</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>English</TableHead>
                <TableHead>Albanian</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTranslations.map((translation) => (
                <TableRow key={translation.id}>
                  <TableCell>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {translation.key}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {translation.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {editingItem?.id === translation.id ? (
                      <Textarea
                        value={editingItem.english}
                        onChange={(e) => setEditingItem({...editingItem, english: e.target.value})}
                        className="min-h-[60px]"
                      />
                    ) : (
                      <div className="max-w-xs truncate">
                        {translation.english}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingItem?.id === translation.id ? (
                      <Textarea
                        value={editingItem.albanian}
                        onChange={(e) => setEditingItem({...editingItem, albanian: e.target.value})}
                        className="min-h-[60px]"
                      />
                    ) : (
                      <div className="max-w-xs truncate">
                        {translation.albanian || <span className="text-gray-400 italic">Not translated</span>}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(translation.status)} border-0`}>
                      {translation.status === 'completed' && <Check className="h-3 w-3 mr-1" />}
                      <span className="capitalize">{translation.status}</span>
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {editingItem?.id === translation.id ? (
                        <>
                          <Button size="sm" onClick={handleSaveEdit}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setEditingItem(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setEditingItem(translation)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Language Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              English Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Completed</span>
                <span>{stats.total}/{stats.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
              <p className="text-xs text-gray-500">100% complete</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              Albanian Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Completed</span>
                <span>{stats.completed}/{stats.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${stats.coverage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500">{stats.coverage}% complete</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
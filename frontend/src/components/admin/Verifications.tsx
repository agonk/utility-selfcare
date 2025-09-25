import React, { useState } from 'react'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Filter,
  Search,
  Download,
  User,
  FileText,
  Calendar
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
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { toast } from 'sonner'

// Mock data for verification requests
const mockVerifications = [
  {
    id: '1',
    userId: 'user_001',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    type: 'identity',
    status: 'pending',
    submittedAt: '2024-01-15T10:30:00Z',
    documents: ['ID Card', 'Utility Bill'],
    notes: 'Initial verification request'
  },
  {
    id: '2',
    userId: 'user_002',
    userName: 'Jane Smith',
    userEmail: 'jane@example.com',
    type: 'address',
    status: 'approved',
    submittedAt: '2024-01-14T14:20:00Z',
    reviewedAt: '2024-01-14T16:45:00Z',
    documents: ['Lease Agreement'],
    notes: 'Address verification completed'
  },
  {
    id: '3',
    userId: 'user_003',
    userName: 'Bob Wilson',
    userEmail: 'bob@example.com',
    type: 'income',
    status: 'rejected',
    submittedAt: '2024-01-13T09:15:00Z',
    reviewedAt: '2024-01-13T11:30:00Z',
    documents: ['Pay Stub'],
    notes: 'Document quality insufficient',
    rejectionReason: 'Document not clear, please resubmit'
  },
  {
    id: '4',
    userId: 'user_004',
    userName: 'Alice Johnson',
    userEmail: 'alice@example.com',
    type: 'identity',
    status: 'pending',
    submittedAt: '2024-01-12T16:45:00Z',
    documents: ['Passport', 'Bank Statement'],
    notes: 'Identity verification request'
  }
]

export const Verifications: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedVerification, setSelectedVerification] = useState<any>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-lime-100 text-lime-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />
      case 'rejected': return <XCircle className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const handleApprove = (id: string) => {
    toast.success('Verification approved successfully')
  }

  const handleReject = (id: string) => {
    toast.success('Verification rejected')
  }

  const filteredVerifications = mockVerifications.filter(verification => {
    const matchesSearch = verification.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         verification.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || verification.status === statusFilter
    const matchesType = typeFilter === 'all' || verification.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const stats = {
    total: mockVerifications.length,
    pending: mockVerifications.filter(v => v.status === 'pending').length,
    approved: mockVerifications.filter(v => v.status === 'approved').length,
    rejected: mockVerifications.filter(v => v.status === 'rejected').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">User Verifications</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review and manage user verification requests
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
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
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
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
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="identity">Identity</SelectItem>
                <SelectItem value="address">Address</SelectItem>
                <SelectItem value="income">Income</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Verifications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Documents</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVerifications.map((verification) => (
                <TableRow key={verification.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" />
                        <AvatarFallback>
                          {verification.userName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {verification.userName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {verification.userEmail}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {verification.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Badge className={`${getStatusColor(verification.status)} border-0`}>
                        {getStatusIcon(verification.status)}
                        <span className="ml-1 capitalize">{verification.status}</span>
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900">
                      {new Date(verification.submittedAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(verification.submittedAt).toLocaleTimeString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900">
                      {verification.documents.join(', ')}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedVerification(verification)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Verification Details</DialogTitle>
                            <DialogDescription>
                              Review verification request for {verification.userName}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium text-gray-600">User</label>
                                <p className="text-sm text-gray-900">{verification.userName}</p>
                                <p className="text-xs text-gray-500">{verification.userEmail}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-600">Type</label>
                                <p className="text-sm text-gray-900 capitalize">{verification.type}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-600">Status</label>
                                <Badge className={`${getStatusColor(verification.status)} border-0 mt-1`}>
                                  {getStatusIcon(verification.status)}
                                  <span className="ml-1 capitalize">{verification.status}</span>
                                </Badge>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-600">Submitted</label>
                                <p className="text-sm text-gray-900">
                                  {new Date(verification.submittedAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium text-gray-600">Documents</label>
                              <div className="mt-1 space-y-1">
                                {verification.documents.map((doc, index) => (
                                  <div key={index} className="flex items-center text-sm text-gray-900">
                                    <FileText className="h-4 w-4 mr-2 text-gray-400" />
                                    {doc}
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <label className="text-sm font-medium text-gray-600">Notes</label>
                              <p className="text-sm text-gray-900">{verification.notes}</p>
                            </div>

                            {verification.status === 'pending' && (
                              <div className="flex space-x-2 pt-4">
                                <Button 
                                  onClick={() => handleApprove(verification.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </Button>
                                <Button 
                                  variant="destructive"
                                  onClick={() => handleReject(verification.id)}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </Button>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>

                      {verification.status === 'pending' && (
                        <>
                          <Button 
                            size="sm"
                            onClick={() => handleApprove(verification.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleReject(verification.id)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
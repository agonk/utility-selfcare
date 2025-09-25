import React from 'react'
import { Eye, X, User } from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { useAuthStore } from '../../stores/authStore'
import { toast } from 'sonner'

export const ImpersonationBanner: React.FC = () => {
  const { isImpersonating, originalUser, impersonatedUser, stopImpersonation } = useAuthStore()

  if (!isImpersonating || !originalUser || !impersonatedUser) {
    return null
  }

  return (
    <div className="bg-orange-100 border-orange-200 border-b px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Eye className="h-4 w-4 text-orange-600" />
            <span className="text-sm text-orange-800">
              You are viewing as
            </span>
            <Badge variant="outline" className="border-orange-300 text-orange-800">
              <User className="h-3 w-3 mr-1" />
              {impersonatedUser.fullName}
            </Badge>
          </div>
          <div className="text-xs text-orange-600">
            Admin: {originalUser.fullName}
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            stopImpersonation()
            toast.success('Returned to admin view')
          }}
          className="border-orange-300 text-orange-800 hover:bg-orange-50"
        >
          <X className="h-4 w-4 mr-1" />
          Exit View
        </Button>
      </div>
    </div>
  )
}
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Edit3, Check, X, Camera, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  status: string
}

const ProfileSection: React.FC = () => {
  const { user, signOut } = useAuth()
  const { toast } = useToast()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({ username: '', full_name: '' })
  const [isExpanded, setIsExpanded] = useState(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setProfile(data)
      setEditData({
        username: data.username || '',
        full_name: data.full_name || ''
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const handleSave = async () => {
    if (!user || !profile) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: editData.username,
          full_name: editData.full_name
        })
        .eq('id', user.id)

      if (error) throw error

      setProfile({
        ...profile,
        username: editData.username,
        full_name: editData.full_name
      })
      setIsEditing(false)
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.'
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setEditData({
        username: profile.username || '',
        full_name: profile.full_name || ''
      })
    }
    setIsEditing(false)
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Signed out',
        description: 'You have been successfully signed out.'
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Error',
        description: 'Failed to sign out',
        variant: 'destructive'
      });
    }
  };

  if (!profile) return null

  return (
    <Card className="bg-gray-800 border-gray-700">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-2 cursor-pointer hover:bg-gray-700/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={profile.avatar_url || ''} alt={profile.username} />
                  <AvatarFallback className="bg-purple-600">
                    {profile.username?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-white">Profile</h3>
                  <p className="text-sm text-gray-400">@{profile.username}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {!isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsEditing(true)
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                )}
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Full Name
                  </label>
                  <Input
                    value={editData.full_name}
                    onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                    placeholder="Enter your full name"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Username
                  </label>
                  <Input
                    value={editData.username}
                    onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                    placeholder="Enter username"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancel}
                    className="border-gray-600 text-gray-300"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400">Full Name</p>
                  <p className="text-white">{profile.full_name || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Status</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-400 text-sm capitalize">{profile.status}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Member Since</p>
                  <p className="text-white text-sm">
                    {new Date(user?.created_at || '').toLocaleDateString()}
                  </p>
                </div>
                
                <div className="pt-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center bg-red-600 hover:bg-red-700"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

export default ProfileSection

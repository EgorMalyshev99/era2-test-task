import { User } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/shared/ui/avatar'

export function MockUserAvatar() {
  return (
    <Avatar size="sm" aria-label="Профиль пользователя">
      <AvatarFallback className="bg-era-bg-3 text-era-fg-dim">
        <User className="size-4" aria-hidden />
      </AvatarFallback>
    </Avatar>
  )
}

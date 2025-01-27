export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          phone: string | null
          location: string | null
          bio: string | null
          role: 'USER' | 'ADMIN'
          status: 'ACTIVE' | 'SUSPENDED' | 'BANNED'
          is_online: boolean
          last_seen: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          phone?: string | null
          location?: string | null
          bio?: string | null
          role?: 'USER' | 'ADMIN'
          status?: 'ACTIVE' | 'SUSPENDED' | 'BANNED'
          is_online?: boolean
          last_seen?: string | null
        }
        Update: {
          email?: string
          name?: string
          phone?: string | null
          location?: string | null
          bio?: string | null
          status?: 'ACTIVE' | 'SUSPENDED' | 'BANNED'
          is_online?: boolean
          last_seen?: string | null
        }
      }
    }
  }
}
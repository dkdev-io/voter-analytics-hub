
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      voter_contacts: {
        Row: {
          id: number
          first_name: string
          last_name: string
          team: string
          date: string
          tactic: string
          attempts: number
          contacts: number
          not_home: number
          refusal: number
          bad_data: number
          support: number
          oppose: number
          undecided: number
          user_id?: string | null
          user_email?: string | null
          label?: string | null
          created_at?: string
        }
        Insert: {
          id?: number
          first_name: string
          last_name: string
          team: string
          date: string
          tactic: string
          attempts: number
          contacts: number
          not_home: number
          refusal: number
          bad_data: number
          support: number
          oppose: number
          undecided: number
          user_id?: string | null
          user_email?: string | null
          label?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          first_name?: string
          last_name?: string
          team?: string
          date?: string
          tactic?: string
          attempts?: number
          contacts?: number
          not_home?: number
          refusal?: number
          bad_data?: number
          support?: number
          oppose?: number
          undecided?: number
          user_id?: string | null
          user_email?: string | null
          label?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

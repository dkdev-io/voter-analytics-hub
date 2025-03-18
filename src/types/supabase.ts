
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
      issue_log: {
        Row: {
          actual_behavior: string | null
          component: string | null
          console_logs: string | null
          date_reported: string | null
          description: string
          expected_behavior: string | null
          id: number
          last_updated: string | null
          reference_links: string | null
          resolution: string | null
          status: string
          theories: string | null
          title: string
        }
        Insert: {
          actual_behavior?: string | null
          component?: string | null
          console_logs?: string | null
          date_reported?: string | null
          description: string
          expected_behavior?: string | null
          id?: number
          last_updated?: string | null
          reference_links?: string | null
          resolution?: string | null
          status?: string
          theories?: string | null
          title: string
        }
        Update: {
          actual_behavior?: string | null
          component?: string | null
          console_logs?: string | null
          date_reported?: string | null
          description?: string
          expected_behavior?: string | null
          id?: number
          last_updated?: string | null
          reference_links?: string | null
          resolution?: string | null
          status?: string
          theories?: string | null
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          created_at?: string
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      solution_attempts: {
        Row: {
          attempt_date: string | null
          description: string
          id: number
          issue_id: number | null
          result: string
          successful: boolean | null
        }
        Insert: {
          attempt_date?: string | null
          description: string
          id?: number
          issue_id?: number | null
          result: string
          successful?: boolean | null
        }
        Update: {
          attempt_date?: string | null
          description?: string
          id?: number
          issue_id?: number | null
          result?: string
          successful?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "solution_attempts_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issue_log"
            referencedColumns: ["id"]
          },
        ]
      }
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
      create_voter_contacts_table: {
        Args: Record<PropertyKey, never>
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

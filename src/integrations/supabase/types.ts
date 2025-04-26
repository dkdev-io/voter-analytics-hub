export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
          full_name: string | null
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          created_at?: string
          full_name?: string | null
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
          attempts: number
          bad_data: number
          contacts: number
          created_at: string | null
          date: string
          first_name: string
          id: number
          label: string | null
          last_name: string
          not_home: number
          oppose: number
          refusal: number
          support: number
          tactic: string
          team: string
          undecided: number
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          attempts?: number
          bad_data?: number
          contacts?: number
          created_at?: string | null
          date: string
          first_name: string
          id?: number
          label?: string | null
          last_name: string
          not_home?: number
          oppose?: number
          refusal?: number
          support?: number
          tactic: string
          team: string
          undecided?: number
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          attempts?: number
          bad_data?: number
          contacts?: number
          created_at?: string | null
          date?: string
          first_name?: string
          id?: number
          label?: string | null
          last_name?: string
          not_home?: number
          oppose?: number
          refusal?: number
          support?: number
          tactic?: string
          team?: string
          undecided?: number
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_voter_contacts_table: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

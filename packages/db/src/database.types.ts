
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "combination_subjects": {
                  Row: {
                    "combination_id": string,"subject_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "combination_id": string,"subject_id": string
                  }
                  Update: {
                    "combination_id"?: string,"subject_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "combination_subjects_combination_id_fkey"
      columns: ["combination_id"]
isOneToOne: false
      referencedRelation: "combinations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "combination_subjects_subject_id_fkey"
      columns: ["subject_id"]
isOneToOne: false
      referencedRelation: "subjects"
      referencedColumns: ["id"]
    }
                  ]
                },"combinations": {
                  Row: {
                    "code": string,"framework_id": string,"id": string,"name": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "code": string,"framework_id": string,"id"?: string,"name"?: string | null
                  }
                  Update: {
                    "code"?: string,"framework_id"?: string,"id"?: string,"name"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "combinations_framework_id_fkey"
      columns: ["framework_id"]
isOneToOne: false
      referencedRelation: "education_frameworks"
      referencedColumns: ["id"]
    }
                  ]
                },"consents": {
                  Row: {
                    "granted_at": string,"id": string,"purpose": string,"user_id": string,"version": string,"withdrawn_at": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "granted_at"?: string,"id"?: string,"purpose": string,"user_id": string,"version": string,"withdrawn_at"?: string | null
                  }
                  Update: {
                    "granted_at"?: string,"id"?: string,"purpose"?: string,"user_id"?: string,"version"?: string,"withdrawn_at"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"degrees": {
                  Row: {
                    "field_id": string,"id": string,"level": string,"name": string
                  }
                  ComputedFields: never
                  Insert: {
                    "field_id": string,"id"?: string,"level": string,"name": string
                  }
                  Update: {
                    "field_id"?: string,"id"?: string,"level"?: string,"name"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "degrees_field_id_fkey"
      columns: ["field_id"]
isOneToOne: false
      referencedRelation: "fields"
      referencedColumns: ["id"]
    }
                  ]
                },"education_frameworks": {
                  Row: {
                    "code": string,"created_at": string,"id": string,"level": string,"name": string,"region_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "code": string,"created_at"?: string,"id"?: string,"level": string,"name": string,"region_id": string
                  }
                  Update: {
                    "code"?: string,"created_at"?: string,"id"?: string,"level"?: string,"name"?: string,"region_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "education_frameworks_region_id_fkey"
      columns: ["region_id"]
isOneToOne: false
      referencedRelation: "regions"
      referencedColumns: ["id"]
    }
                  ]
                },"fields": {
                  Row: {
                    "id": string,"name": string,"slug": string
                  }
                  ComputedFields: never
                  Insert: {
                    "id"?: string,"name": string,"slug": string
                  }
                  Update: {
                    "id"?: string,"name"?: string,"slug"?: string
                  }
                  Relationships: [
                    
                  ]
                },"historical_cutoffs": {
                  Row: {
                    "created_at": string,"entered_by": string | null,"id": string,"intake_year": number,"is_illustrative": boolean,"points": number,"programme_id": string,"reviewed_by": string | null,"scheme": string,"sex": string,"source_url": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"entered_by"?: string | null,"id"?: string,"intake_year": number,"is_illustrative"?: boolean,"points": number,"programme_id": string,"reviewed_by"?: string | null,"scheme"?: string,"sex"?: string,"source_url"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"entered_by"?: string | null,"id"?: string,"intake_year"?: number,"is_illustrative"?: boolean,"points"?: number,"programme_id"?: string,"reviewed_by"?: string | null,"scheme"?: string,"sex"?: string,"source_url"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "historical_cutoffs_programme_id_fkey"
      columns: ["programme_id"]
isOneToOne: false
      referencedRelation: "programmes"
      referencedColumns: ["id"]
    }
                  ]
                },"institutions": {
                  Row: {
                    "created_at": string,"id": string,"name": string,"region_id": string,"short_name": string | null,"type": string,"website": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"name": string,"region_id": string,"short_name"?: string | null,"type": string,"website"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"name"?: string,"region_id"?: string,"short_name"?: string | null,"type"?: string,"website"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "institutions_region_id_fkey"
      columns: ["region_id"]
isOneToOne: false
      referencedRelation: "regions"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "birth_year": number | null,"created_at": string,"display_name": string | null,"persona": string,"region_id": string | null,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "birth_year"?: number | null,"created_at"?: string,"display_name"?: string | null,"persona"?: string,"region_id"?: string | null,"user_id": string
                  }
                  Update: {
                    "birth_year"?: number | null,"created_at"?: string,"display_name"?: string | null,"persona"?: string,"region_id"?: string | null,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "profiles_region_id_fkey"
      columns: ["region_id"]
isOneToOne: false
      referencedRelation: "regions"
      referencedColumns: ["id"]
    }
                  ]
                },"programme_requirements": {
                  Row: {
                    "min_grade": string | null,"programme_id": string,"role": string,"rule_set_id": string,"subject_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "min_grade"?: string | null,"programme_id": string,"role": string,"rule_set_id": string,"subject_id": string
                  }
                  Update: {
                    "min_grade"?: string | null,"programme_id"?: string,"role"?: string,"rule_set_id"?: string,"subject_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "programme_requirements_programme_id_fkey"
      columns: ["programme_id"]
isOneToOne: false
      referencedRelation: "programmes"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "programme_requirements_rule_set_id_fkey"
      columns: ["rule_set_id"]
isOneToOne: false
      referencedRelation: "rule_sets"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "programme_requirements_subject_id_fkey"
      columns: ["subject_id"]
isOneToOne: false
      referencedRelation: "subjects"
      referencedColumns: ["id"]
    }
                  ]
                },"programmes": {
                  Row: {
                    "active": boolean,"created_at": string,"degree_id": string,"duration_years": number | null,"fees_band": string | null,"id": string,"institution_id": string,"national_code": string,"title": string
                  }
                  ComputedFields: never
                  Insert: {
                    "active"?: boolean,"created_at"?: string,"degree_id": string,"duration_years"?: number | null,"fees_band"?: string | null,"id"?: string,"institution_id": string,"national_code": string,"title": string
                  }
                  Update: {
                    "active"?: boolean,"created_at"?: string,"degree_id"?: string,"duration_years"?: number | null,"fees_band"?: string | null,"id"?: string,"institution_id"?: string,"national_code"?: string,"title"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "programmes_degree_id_fkey"
      columns: ["degree_id"]
isOneToOne: false
      referencedRelation: "degrees"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "programmes_institution_id_fkey"
      columns: ["institution_id"]
isOneToOne: false
      referencedRelation: "institutions"
      referencedColumns: ["id"]
    }
                  ]
                },"regions": {
                  Row: {
                    "created_at": string,"currency": string,"id": string,"iso_code": string,"locale": string,"name": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"currency": string,"id"?: string,"iso_code": string,"locale"?: string,"name": string
                  }
                  Update: {
                    "created_at"?: string,"currency"?: string,"id"?: string,"iso_code"?: string,"locale"?: string,"name"?: string
                  }
                  Relationships: [
                    
                  ]
                },"rule_sets": {
                  Row: {
                    "created_at": string,"framework_id": string,"id": string,"rules": NonNullable<Json>,"source_url": string | null,"status": string,"valid_from_intake": number | null,"verified_at": string | null,"verified_by": string | null,"version": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"framework_id": string,"id"?: string,"rules": NonNullable<Json>,"source_url"?: string | null,"status"?: string,"valid_from_intake"?: number | null,"verified_at"?: string | null,"verified_by"?: string | null,"version": string
                  }
                  Update: {
                    "created_at"?: string,"framework_id"?: string,"id"?: string,"rules"?: NonNullable<Json>,"source_url"?: string | null,"status"?: string,"valid_from_intake"?: number | null,"verified_at"?: string | null,"verified_by"?: string | null,"version"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "rule_sets_framework_id_fkey"
      columns: ["framework_id"]
isOneToOne: false
      referencedRelation: "education_frameworks"
      referencedColumns: ["id"]
    }
                  ]
                },"saved_simulations": {
                  Row: {
                    "created_at": string,"id": string,"inputs": NonNullable<Json>,"results": NonNullable<Json>,"rule_set_id": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"inputs": NonNullable<Json>,"results": NonNullable<Json>,"rule_set_id": string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"inputs"?: NonNullable<Json>,"results"?: NonNullable<Json>,"rule_set_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "saved_simulations_rule_set_id_fkey"
      columns: ["rule_set_id"]
isOneToOne: false
      referencedRelation: "rule_sets"
      referencedColumns: ["id"]
    }
                  ]
                },"subjects": {
                  Row: {
                    "code": string,"framework_id": string,"id": string,"kind": string,"name": string
                  }
                  ComputedFields: never
                  Insert: {
                    "code": string,"framework_id": string,"id"?: string,"kind": string,"name": string
                  }
                  Update: {
                    "code"?: string,"framework_id"?: string,"id"?: string,"kind"?: string,"name"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "subjects_framework_id_fkey"
      columns: ["framework_id"]
isOneToOne: false
      referencedRelation: "education_frameworks"
      referencedColumns: ["id"]
    }
                  ]
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
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            
          }
        }
} as const

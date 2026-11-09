
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
            "career_clusters": {
                  Row: {
                    "description": string,"id": string,"name": string,"slug": string,"sort_order": number
                  }
                  ComputedFields: never
                  Insert: {
                    "description": string,"id"?: string,"name": string,"slug": string,"sort_order"?: number
                  }
                  Update: {
                    "description"?: string,"id"?: string,"name"?: string,"slug"?: string,"sort_order"?: number
                  }
                  Relationships: [
                    
                  ]
                },"certifications": {
                  Row: {
                    "id": string,"issuer": string | null,"name": string,"scope": string,"slug": string,"typical_months": number | null
                  }
                  ComputedFields: never
                  Insert: {
                    "id"?: string,"issuer"?: string | null,"name": string,"scope"?: string,"slug": string,"typical_months"?: number | null
                  }
                  Update: {
                    "id"?: string,"issuer"?: string | null,"name"?: string,"scope"?: string,"slug"?: string,"typical_months"?: number | null
                  }
                  Relationships: [
                    
                  ]
                },"combination_subjects": {
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
                },"data_sources": {
                  Row: {
                    "access_method": string,"attribution": string,"id": string,"last_checked_at": string | null,"licence": string,"licence_url": string | null,"name": string,"notes": string | null,"publisher": string,"slug": string,"status": string,"update_frequency": string,"url": string
                  }
                  ComputedFields: never
                  Insert: {
                    "access_method": string,"attribution": string,"id"?: string,"last_checked_at"?: string | null,"licence": string,"licence_url"?: string | null,"name": string,"notes"?: string | null,"publisher": string,"slug": string,"status"?: string,"update_frequency": string,"url": string
                  }
                  Update: {
                    "access_method"?: string,"attribution"?: string,"id"?: string,"last_checked_at"?: string | null,"licence"?: string,"licence_url"?: string | null,"name"?: string,"notes"?: string | null,"publisher"?: string,"slug"?: string,"status"?: string,"update_frequency"?: string,"url"?: string
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
                },"global_subjects": {
                  Row: {
                    "description": string,"id": string,"name": string,"slug": string
                  }
                  ComputedFields: never
                  Insert: {
                    "description": string,"id"?: string,"name": string,"slug": string
                  }
                  Update: {
                    "description"?: string,"id"?: string,"name"?: string,"slug"?: string
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
                },"ingestion_runs": {
                  Row: {
                    "error": string | null,"finished_at": string | null,"id": string,"params": NonNullable<Json>,"rows_read": number,"rows_written": number,"source_id": string,"started_at": string,"status": string
                  }
                  ComputedFields: never
                  Insert: {
                    "error"?: string | null,"finished_at"?: string | null,"id"?: string,"params"?: NonNullable<Json>,"rows_read"?: number,"rows_written"?: number,"source_id": string,"started_at"?: string,"status"?: string
                  }
                  Update: {
                    "error"?: string | null,"finished_at"?: string | null,"id"?: string,"params"?: NonNullable<Json>,"rows_read"?: number,"rows_written"?: number,"source_id"?: string,"started_at"?: string,"status"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "ingestion_runs_source_id_fkey"
      columns: ["source_id"]
isOneToOne: false
      referencedRelation: "data_sources"
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
                },"job_postings": {
                  Row: {
                    "apply_url": string,"city": string | null,"expires_at": string | null,"external_id": string,"id": string,"ingestion_run_id": string | null,"isco_code": string | null,"occupation_id": string | null,"organisation": string | null,"posted_at": string,"region_id": string | null,"remote": boolean,"salary_currency": string | null,"salary_max": number | null,"salary_min": number | null,"salary_period": string | null,"source_id": string,"status": string,"title": string
                  }
                  ComputedFields: never
                  Insert: {
                    "apply_url": string,"city"?: string | null,"expires_at"?: string | null,"external_id": string,"id"?: string,"ingestion_run_id"?: string | null,"isco_code"?: string | null,"occupation_id"?: string | null,"organisation"?: string | null,"posted_at": string,"region_id"?: string | null,"remote"?: boolean,"salary_currency"?: string | null,"salary_max"?: number | null,"salary_min"?: number | null,"salary_period"?: string | null,"source_id": string,"status"?: string,"title": string
                  }
                  Update: {
                    "apply_url"?: string,"city"?: string | null,"expires_at"?: string | null,"external_id"?: string,"id"?: string,"ingestion_run_id"?: string | null,"isco_code"?: string | null,"occupation_id"?: string | null,"organisation"?: string | null,"posted_at"?: string,"region_id"?: string | null,"remote"?: boolean,"salary_currency"?: string | null,"salary_max"?: number | null,"salary_min"?: number | null,"salary_period"?: string | null,"source_id"?: string,"status"?: string,"title"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "job_postings_ingestion_run_id_fkey"
      columns: ["ingestion_run_id"]
isOneToOne: false
      referencedRelation: "ingestion_runs"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "job_postings_occupation_id_fkey"
      columns: ["occupation_id"]
isOneToOne: false
      referencedRelation: "occupations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "job_postings_region_id_fkey"
      columns: ["region_id"]
isOneToOne: false
      referencedRelation: "regions"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "job_postings_source_id_fkey"
      columns: ["source_id"]
isOneToOne: false
      referencedRelation: "data_sources"
      referencedColumns: ["id"]
    }
                  ]
                },"labour_indicators": {
                  Row: {
                    "age_group": string,"education_level": string,"id": number,"indicator_code": string,"indicator_name": string,"ingestion_run_id": string | null,"isco_code": string | null,"observation_status": string | null,"period": string,"region_id": string,"sex": string,"source_id": string,"unit": string,"urbanisation": string,"value": number
                  }
                  ComputedFields: never
                  Insert: {
                    "age_group"?: string,"education_level"?: string,"id"?: never,"indicator_code": string,"indicator_name": string,"ingestion_run_id"?: string | null,"isco_code"?: string | null,"observation_status"?: string | null,"period": string,"region_id": string,"sex"?: string,"source_id": string,"unit": string,"urbanisation"?: string,"value": number
                  }
                  Update: {
                    "age_group"?: string,"education_level"?: string,"id"?: never,"indicator_code"?: string,"indicator_name"?: string,"ingestion_run_id"?: string | null,"isco_code"?: string | null,"observation_status"?: string | null,"period"?: string,"region_id"?: string,"sex"?: string,"source_id"?: string,"unit"?: string,"urbanisation"?: string,"value"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "labour_indicators_ingestion_run_id_fkey"
      columns: ["ingestion_run_id"]
isOneToOne: false
      referencedRelation: "ingestion_runs"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "labour_indicators_region_id_fkey"
      columns: ["region_id"]
isOneToOne: false
      referencedRelation: "regions"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "labour_indicators_source_id_fkey"
      columns: ["source_id"]
isOneToOne: false
      referencedRelation: "data_sources"
      referencedColumns: ["id"]
    }
                  ]
                },"occupation_crosswalks": {
                  Row: {
                    "code": string,"label": string | null,"occupation_id": string,"region_id": string | null,"scheme": string,"source_id": string | null,"uri": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "code": string,"label"?: string | null,"occupation_id": string,"region_id"?: string | null,"scheme": string,"source_id"?: string | null,"uri"?: string | null
                  }
                  Update: {
                    "code"?: string,"label"?: string | null,"occupation_id"?: string,"region_id"?: string | null,"scheme"?: string,"source_id"?: string | null,"uri"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "occupation_crosswalks_occupation_id_fkey"
      columns: ["occupation_id"]
isOneToOne: false
      referencedRelation: "occupations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "occupation_crosswalks_region_id_fkey"
      columns: ["region_id"]
isOneToOne: false
      referencedRelation: "regions"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "occupation_crosswalks_source_id_fkey"
      columns: ["source_id"]
isOneToOne: false
      referencedRelation: "data_sources"
      referencedColumns: ["id"]
    }
                  ]
                },"occupation_localisations": {
                  Row: {
                    "context": string | null,"demand": string,"is_illustrative": boolean,"last_reviewed_at": string | null,"local_title": string | null,"occupation_id": string,"region_id": string,"regulator": string | null,"regulator_url": string | null,"salary_band_high": number | null,"salary_band_low": number | null,"salary_period": string | null,"salary_source": string | null,"salary_year": number | null,"source_url": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "context"?: string | null,"demand"?: string,"is_illustrative"?: boolean,"last_reviewed_at"?: string | null,"local_title"?: string | null,"occupation_id": string,"region_id": string,"regulator"?: string | null,"regulator_url"?: string | null,"salary_band_high"?: number | null,"salary_band_low"?: number | null,"salary_period"?: string | null,"salary_source"?: string | null,"salary_year"?: number | null,"source_url"?: string | null
                  }
                  Update: {
                    "context"?: string | null,"demand"?: string,"is_illustrative"?: boolean,"last_reviewed_at"?: string | null,"local_title"?: string | null,"occupation_id"?: string,"region_id"?: string,"regulator"?: string | null,"regulator_url"?: string | null,"salary_band_high"?: number | null,"salary_band_low"?: number | null,"salary_period"?: string | null,"salary_source"?: string | null,"salary_year"?: number | null,"source_url"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "occupation_localisations_occupation_id_fkey"
      columns: ["occupation_id"]
isOneToOne: false
      referencedRelation: "occupations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "occupation_localisations_region_id_fkey"
      columns: ["region_id"]
isOneToOne: false
      referencedRelation: "regions"
      referencedColumns: ["id"]
    }
                  ]
                },"occupation_skills": {
                  Row: {
                    "importance": number,"occupation_id": string,"skill_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "importance"?: number,"occupation_id": string,"skill_id": string
                  }
                  Update: {
                    "importance"?: number,"occupation_id"?: string,"skill_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "occupation_skills_occupation_id_fkey"
      columns: ["occupation_id"]
isOneToOne: false
      referencedRelation: "occupations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "occupation_skills_skill_id_fkey"
      columns: ["skill_id"]
isOneToOne: false
      referencedRelation: "skills"
      referencedColumns: ["id"]
    }
                  ]
                },"occupation_subjects": {
                  Row: {
                    "global_subject_id": string,"occupation_id": string,"requirement": string
                  }
                  ComputedFields: never
                  Insert: {
                    "global_subject_id": string,"occupation_id": string,"requirement": string
                  }
                  Update: {
                    "global_subject_id"?: string,"occupation_id"?: string,"requirement"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "occupation_subjects_global_subject_id_fkey"
      columns: ["global_subject_id"]
isOneToOne: false
      referencedRelation: "global_subjects"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "occupation_subjects_occupation_id_fkey"
      columns: ["occupation_id"]
isOneToOne: false
      referencedRelation: "occupations"
      referencedColumns: ["id"]
    }
                  ]
                },"occupation_transitions": {
                  Row: {
                    "evidence_count": number,"from_occupation_id": string,"id": string,"kind": string,"region_id": string | null,"source_url": string | null,"to_occupation_id": string,"typical_years": number | null,"via": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "evidence_count"?: number,"from_occupation_id": string,"id"?: string,"kind": string,"region_id"?: string | null,"source_url"?: string | null,"to_occupation_id": string,"typical_years"?: number | null,"via"?: string | null
                  }
                  Update: {
                    "evidence_count"?: number,"from_occupation_id"?: string,"id"?: string,"kind"?: string,"region_id"?: string | null,"source_url"?: string | null,"to_occupation_id"?: string,"typical_years"?: number | null,"via"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "occupation_transitions_from_occupation_id_fkey"
      columns: ["from_occupation_id"]
isOneToOne: false
      referencedRelation: "occupations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "occupation_transitions_region_id_fkey"
      columns: ["region_id"]
isOneToOne: false
      referencedRelation: "regions"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "occupation_transitions_to_occupation_id_fkey"
      columns: ["to_occupation_id"]
isOneToOne: false
      referencedRelation: "occupations"
      referencedColumns: ["id"]
    }
                  ]
                },"occupations": {
                  Row: {
                    "cluster_id": string,"created_at": string,"id": string,"isco_code": string | null,"last_reviewed_at": string | null,"riasec": string | null,"school_subjects": (string)[],"slug": string,"source_url": string | null,"status": string,"summary": string,"tasks": (string)[],"title": string,"typical_level": string
                  }
                  ComputedFields: never
                  Insert: {
                    "cluster_id": string,"created_at"?: string,"id"?: string,"isco_code"?: string | null,"last_reviewed_at"?: string | null,"riasec"?: string | null,"school_subjects"?: (string)[],"slug": string,"source_url"?: string | null,"status"?: string,"summary": string,"tasks"?: (string)[],"title": string,"typical_level": string
                  }
                  Update: {
                    "cluster_id"?: string,"created_at"?: string,"id"?: string,"isco_code"?: string | null,"last_reviewed_at"?: string | null,"riasec"?: string | null,"school_subjects"?: (string)[],"slug"?: string,"source_url"?: string | null,"status"?: string,"summary"?: string,"tasks"?: (string)[],"title"?: string,"typical_level"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "occupations_cluster_id_fkey"
      columns: ["cluster_id"]
isOneToOne: false
      referencedRelation: "career_clusters"
      referencedColumns: ["id"]
    }
                  ]
                },"page_feedback": {
                  Row: {
                    "comment": string | null,"created_at": string,"helpful": boolean,"id": string,"location": string | null,"page_path": string
                  }
                  ComputedFields: never
                  Insert: {
                    "comment"?: string | null,"created_at"?: string,"helpful": boolean,"id"?: string,"location"?: string | null,"page_path": string
                  }
                  Update: {
                    "comment"?: string | null,"created_at"?: string,"helpful"?: boolean,"id"?: string,"location"?: string | null,"page_path"?: string
                  }
                  Relationships: [
                    
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
                },"qualification_routes": {
                  Row: {
                    "certification_id": string | null,"degree_id": string | null,"id": string,"last_reviewed_at": string | null,"occupation_id": string,"region_id": string | null,"route_type": string,"sort_order": number,"source_url": string | null,"title": string,"typical_years": number | null
                  }
                  ComputedFields: never
                  Insert: {
                    "certification_id"?: string | null,"degree_id"?: string | null,"id"?: string,"last_reviewed_at"?: string | null,"occupation_id": string,"region_id"?: string | null,"route_type": string,"sort_order"?: number,"source_url"?: string | null,"title": string,"typical_years"?: number | null
                  }
                  Update: {
                    "certification_id"?: string | null,"degree_id"?: string | null,"id"?: string,"last_reviewed_at"?: string | null,"occupation_id"?: string,"region_id"?: string | null,"route_type"?: string,"sort_order"?: number,"source_url"?: string | null,"title"?: string,"typical_years"?: number | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "qualification_routes_certification_id_fkey"
      columns: ["certification_id"]
isOneToOne: false
      referencedRelation: "certifications"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "qualification_routes_degree_id_fkey"
      columns: ["degree_id"]
isOneToOne: false
      referencedRelation: "degrees"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "qualification_routes_occupation_id_fkey"
      columns: ["occupation_id"]
isOneToOne: false
      referencedRelation: "occupations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "qualification_routes_region_id_fkey"
      columns: ["region_id"]
isOneToOne: false
      referencedRelation: "regions"
      referencedColumns: ["id"]
    }
                  ]
                },"regions": {
                  Row: {
                    "created_at": string,"currency": string | null,"id": string,"iso_code": string,"locale": string,"name": string,"secondary_exams": string | null,"sort_order": number
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"currency"?: string | null,"id"?: string,"iso_code": string,"locale"?: string,"name": string,"secondary_exams"?: string | null,"sort_order"?: number
                  }
                  Update: {
                    "created_at"?: string,"currency"?: string | null,"id"?: string,"iso_code"?: string,"locale"?: string,"name"?: string,"secondary_exams"?: string | null,"sort_order"?: number
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
                },"saved_items": {
                  Row: {
                    "created_at": string,"item_key": string,"item_type": string,"location": string | null,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"item_key": string,"item_type": string,"location"?: string | null,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"item_key"?: string,"item_type"?: string,"location"?: string | null,"user_id"?: string
                  }
                  Relationships: [
                    
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
                },"skills": {
                  Row: {
                    "esco_uri": string | null,"id": string,"kind": string,"name": string,"slug": string
                  }
                  ComputedFields: never
                  Insert: {
                    "esco_uri"?: string | null,"id"?: string,"kind"?: string,"name": string,"slug": string
                  }
                  Update: {
                    "esco_uri"?: string | null,"id"?: string,"kind"?: string,"name"?: string,"slug"?: string
                  }
                  Relationships: [
                    
                  ]
                },"subjects": {
                  Row: {
                    "code": string,"framework_id": string,"global_subject_id": string | null,"id": string,"kind": string,"name": string
                  }
                  ComputedFields: never
                  Insert: {
                    "code": string,"framework_id": string,"global_subject_id"?: string | null,"id"?: string,"kind": string,"name": string
                  }
                  Update: {
                    "code"?: string,"framework_id"?: string,"global_subject_id"?: string | null,"id"?: string,"kind"?: string,"name"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "subjects_framework_id_fkey"
      columns: ["framework_id"]
isOneToOne: false
      referencedRelation: "education_frameworks"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "subjects_global_subject_id_fkey"
      columns: ["global_subject_id"]
isOneToOne: false
      referencedRelation: "global_subjects"
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

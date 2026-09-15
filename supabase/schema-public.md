# Esquema `public` de Supabase

> Generado con `pnpm db:schema`. **No lo edites a mano.**
>
> Es la referencia del esquema real en produccion. Varias tablas del CRM se
> crearon con los `.sql` sueltos de `scripts/` y no estan en `supabase/migrations`,
> asi que este archivo es la unica fuente fiel del estado actual.

Tablas y vistas: 31

## activities

| Columna | Tipo | Nulo | Default | Notas |
| --- | --- | --- | --- | --- |
| id | uuid | NO | `extensions.uuid_generate_v4()` | PK |
| contact_id | uuid | sí |  | FK → contacts.id |
| deal_id | uuid | sí |  | FK → deals.id |
| activity_type | character varying | NO |  |  |
| subject | character varying | NO |  |  |
| description | text | sí |  |  |
| status | character varying | sí | `completed` |  |
| scheduled_at | timestamp with time zone | sí |  |  |
| completed_at | timestamp with time zone | sí |  |  |
| duration_minutes | integer | sí |  |  |
| outcome | character varying | sí |  |  |
| next_action | text | sí |  |  |
| created_by | uuid | sí |  | FK → users_view.id |
| created_at | timestamp with time zone | sí | `now()` |  |
| updated_at | timestamp with time zone | sí | `now()` |  |

## blog

| Columna | Tipo | Nulo | Default | Notas |
| --- | --- | --- | --- | --- |
| id | uuid | NO | `gen_random_uuid()` | PK |
| title_es | text | sí |  |  |
| title_en | text | sí |  |  |
| title | text | sí |  |  |
| content_es | text | sí |  |  |
| content_en | text | sí |  |  |
| content | text | sí |  |  |
| excerpt_es | text | sí |  |  |
| excerpt_en | text | sí |  |  |
| excerpt | text | sí |  |  |
| slug | text | sí |  |  |
| image_url | text | sí |  |  |
| category | text | sí |  |  |
| author_id | uuid | sí |  | FK → users_view.id |
| published | boolean | sí | `false` |  |
| created_at | timestamp with time zone | sí | `now()` |  |
| updated_at | timestamp with time zone | sí | `now()` |  |
| notification_sent_at | timestamp with time zone | sí |  |  |
| slug_es | text | sí |  |  |

## companies

| Columna | Tipo | Nulo | Default | Notas |
| --- | --- | --- | --- | --- |
| id | uuid | NO | `gen_random_uuid()` | PK |
| name | text | NO |  |  |
| user_id | uuid | sí |  | FK → users_view.id |
| logo_url | text | sí |  |  |
| created_at | timestamp with time zone | sí | `now()` |  |
| updated_at | timestamp with time zone | sí | `now()` |  |

## contact

| Columna | Tipo | Nulo | Default | Notas |
| --- | --- | --- | --- | --- |
| id | uuid | NO | `gen_random_uuid()` | PK |
| address | text | sí |  |  |
| phone | text | sí |  |  |
| email | text | sí |  |  |
| description | text | sí |  |  |
| facebook | text | sí |  |  |
| twitter | text | sí |  |  |
| instagram | text | sí |  |  |
| linkedin | text | sí |  |  |
| youtube | text | sí |  |  |
| tiktok | text | sí |  |  |
| twitch | text | sí |  |  |
| whatsapp | text | sí |  |  |
| created_at | timestamp with time zone | sí | `now()` |  |
| updated_at | timestamp with time zone | sí | `now()` |  |
| spotify | text | sí |  |  |
| threads | text | sí |  |  |
| facebook_visible | boolean | sí | `true` |  |
| twitter_visible | boolean | sí | `true` |  |
| instagram_visible | boolean | sí | `true` |  |
| linkedin_visible | boolean | sí | `true` |  |
| youtube_visible | boolean | sí | `true` |  |
| tiktok_visible | boolean | sí | `true` |  |
| twitch_visible | boolean | sí | `true` |  |
| whatsapp_visible | boolean | sí | `true` |  |
| spotify_visible | boolean | sí | `true` |  |
| threads_visible | boolean | sí | `true` |  |

## contact_custom_fields

| Columna | Tipo | Nulo | Default | Notas |
| --- | --- | --- | --- | --- |
| id | uuid | NO | `extensions.uuid_generate_v4()` | PK |
| contact_id | uuid | sí |  | FK → contacts.id |
| field_name | character varying | NO |  |  |
| field_value | text | sí |  |  |
| created_at | timestamp with time zone | sí | `now()` |  |
| updated_at | timestamp with time zone | sí | `now()` |  |

## contact_emails

| Columna | Tipo | Nulo | Default | Notas |
| --- | --- | --- | --- | --- |
| id | uuid | NO | `gen_random_uuid()` | PK |
| contact_id | uuid | sí |  | FK → contacts.id |
| status | character varying | NO |  |  |
| subject | text | NO |  |  |
| body | text | NO |  |  |
| sent_at | timestamp with time zone | sí | `now()` |  |
| sent_by | uuid | sí |  | FK → users_view.id |
| created_at | timestamp with time zone | sí | `now()` |  |

## contact_messages

| Columna | Tipo | Nulo | Default | Notas |
| --- | --- | --- | --- | --- |
| id | uuid | NO | `gen_random_uuid()` | PK |
| first_name | text | NO |  |  |
| last_name | text | NO |  |  |
| email | text | NO |  |  |
| phone_number | text | sí |  |  |
| message | text | NO |  |  |
| status | text | sí | `unread` |  |
| created_at | timestamp with time zone | sí | `now()` |  |
| updated_at | timestamp with time zone | sí | `now()` |  |

## contacts

| Columna | Tipo | Nulo | Default | Notas |
| --- | --- | --- | --- | --- |
| id | uuid | NO | `extensions.uuid_generate_v4()` | PK |
| first_name | character varying | sí |  |  |
| last_name | character varying | sí |  |  |
| email | character varying | NO |  |  |
| phone | character varying | sí |  |  |
| company | character varying | sí |  |  |
| job_title | character varying | sí |  |  |
| contact_type | character varying | NO | `lead` |  |
| status | character varying | NO | `active` |  |
| source | character varying | sí |  |  |
| tags | text[] | sí |  |  |
| address_street | character varying | sí |  |  |
| address_city | character varying | sí |  |  |
| address_state | character varying | sí |  |  |
| address_country | character varying | sí |  |  |
| address_postal_code | character varying | sí |  |  |
| linkedin_url | character varying | sí |  |  |
| website_url | character varying | sí |  |  |
| notes | text | sí |  |  |
| assigned_to | uuid | sí |  | FK → users_view.id |
| created_by | uuid | sí |  | FK → users_view.id |
| created_at | timestamp with time zone | sí | `now()` |  |
| updated_at | timestamp with time zone | sí | `now()` |  |
| instagram_url | text | sí |  |  |
| additional_emails | text[] | sí |  |  |
| social_links | jsonb | sí |  |  |
| additional_phones | text[] | sí |  |  |
| invalid_emails | text[] | sí |  |  |

## contracts

| Columna | Tipo | Nulo | Default | Notas |
| --- | --- | --- | --- | --- |
| id | uuid | NO | `gen_random_uuid()` | PK |
| quote_id | uuid | NO |  | FK → quotes.id |
| folio | text | NO |  |  |
| status | text | NO | `draft` |  |
| lang | text | NO | `es` |  |
| body_html | text | NO |  |  |
| token | text | NO |  |  |
| sent_at | timestamp with time zone | sí |  |  |
| signed_at | timestamp with time zone | sí |  |  |
| signed_name | text | sí |  |  |
| signed_ip | text | sí |  |  |
| signed_user_agent | text | sí |  |  |
| created_at | timestamp with time zone | NO | `timezone('utc'::text, now())` |  |
| updated_at | timestamp with time zone | NO | `timezone('utc'::text, now())` |  |

## deal_emails

| Columna | Tipo | Nulo | Default | Notas |
| --- | --- | --- | --- | --- |
| id | uuid | NO | `gen_random_uuid()` | PK |
| deal_id | uuid | NO |  | FK → deals.id |
| stage | character varying | NO |  |  |
| subject | text | NO |  |  |
| body | text | NO |  |  |
| sent_at | timestamp with time zone | NO | `now()` |  |
| sent_by | uuid | sí |  | FK → users_view.id |
| created_at | timestamp with time zone | sí | `now()` |  |

## deal_stages

| Columna | Tipo | Nulo | Default | Notas |
| --- | --- | --- | --- | --- |
| id | uuid | NO | `extensions.uuid_generate_v4()` | PK |
| name_es | character varying | NO |  |  |
| name_en | character varying | NO |  |  |
| slug | character varying | NO |  |  |
| color | character varying | sí | `gray` |  |
| order_index | integer | NO | `0` |  |
| is_closed | boolean | sí | `false` |  |
| created_at | timestamp with time zone | sí | `now()` |  |
| updated_at | timestamp with time zone | sí | `now()` |  |

## deals

| Columna | Tipo | Nulo | Default | Notas |
| --- | --- | --- | --- | --- |
| id | uuid | NO | `extensions.uuid_generate_v4()` | PK |
| contact_id | uuid | sí |  | FK → contacts.id |
| service_id | uuid | sí |  | FK → services.id |
| title | character varying | NO |  |  |
| description | text | sí |  |  |
| value | numeric | NO | `0` |  |
| currency | character varying | sí | `MXN` |  |
| stage | character varying | NO | `no_contact` |  |
| probability | integer | sí | `0` |  |
| expected_close_date | date | sí |  |  |
| actual_close_date | date | sí |  |  |
| lost_reason | text | sí |  |  |
| tags | text[] | sí |  |  |
| assigned_to | uuid | sí |  | FK → users_view.id |
| created_by | uuid | sí |  | FK → users_view.id |
| created_at | timestamp with time zone | sí | `now()` |  |
| updated_at | timestamp with time zone | sí | `now()` |  |
| quotation_id | uuid | sí |  | FK → quotations.id |
| email_sent | boolean | sí | `false` |  |

## feedbacks

| Columna | Tipo | Nulo | Default | Notas |
| --- | --- | --- | --- | --- |
| id | uuid | NO | `gen_random_uuid()` | PK |
| user_id | uuid | NO |  | FK → users_view.id |
| title | text | NO |  |  |
| description | text | NO |  |  |
| status | text | sí | `pending` |  |
| admin_notes | text | sí |  |  |
| created_at | timestamp with time zone | NO | `now()` |  |
| updated_at | timestamp with time zone | NO | `now()` |  |

## portfolio

| Columna | Tipo | Nulo | Default | Notas |
| --- | --- | --- | --- | --- |
| id | uuid | NO | `gen_random_uuid()` | PK |
| title_es | text | sí |  |  |
| title_en | text | sí |  |  |
| title | text | sí |  |  |
| description_es | text | sí |  |  |
| description_en | text | sí |  |  |
| description | text | sí |  |  |
| slug | text | sí |  |  |
| image_url | text | sí |  |  |
| project_url | text | sí |  |  |
| client | text | sí |  |  |
| company_id | uuid | sí |  | FK → companies.id |
| project_type | text | sí |  |  |
| created_at | timestamp with time zone | sí | `now()` |  |
| challenge_es | text | sí |  |  |
| challenge_en | text | sí |  |  |
| results_es | text[] | sí |  |  |
| results_en | text[] | sí |  |  |
| client_quote_es | text | sí |  |  |
| client_quote_en | text | sí |  |  |
| year | integer | sí |  |  |

## processed_stripe_events

| Columna | Tipo | Nulo | Default | Notas |
| --- | --- | --- | --- | --- |
| id | text | NO |  | PK |
| created_at | timestamp with time zone | NO | `timezone('utc'::text, now())` |  |

## project_payments

| Columna | Tipo | Nulo | Default | Notas |
| --- | --- | --- | --- | --- |
| id | uuid | NO | `gen_random_uuid()` | PK |
| project_id | uuid | NO |  | FK → projects.id |
| amount | numeric | NO |  |  |
| currency | text | sí | `MXN` |  |
| payment_method | text | sí |  |  |
| payment_date | date | sí |  |  |
| notes | text | sí |  |  |
| status | text | sí | `pending` |  |
| created_at | timestamp with time zone | sí | `now()` |  |
| updated_at | timestamp with time zone | sí | `now()` |  |

## project_tasks

| Columna | Tipo | Nulo | Default | Notas |
| --- | --- | --- | --- | --- |
| id | uuid | NO | `gen_random_uuid()` | PK |
| project_id | uuid | NO |  | FK → projects.id |
| title | text | NO |  |  |
| description | text | sí |  |  |
| completed | boolean | NO | `false` |  |
| order_index | integer | NO | `0` |  |
| created_at | timestamp with time zone | sí | `now()` |  |
| updated_at | timestamp with time zone | sí | `now()` |  |
| completed_at | timestamp with time zone | sí |  |  |
| priority | text | sí | `medium` |  |
| category | text | sí |  |  |

## project_technologies

| Columna | Tipo | Nulo | Default | Notas |
| --- | --- | --- | --- | --- |
| id | uuid | NO | `gen_random_uuid()` | PK |
| project_id | uuid | NO |  | FK → projects.id |
| technology_id | uuid | NO |  | FK → technologies.id |
| created_at | timestamp with time zone | sí | `now()` |  |

## projects

| Columna | Tipo | Nulo | Default | Notas |
| --- | --- | --- | --- | --- |
| id | uuid | NO | `gen_random_uuid()` | PK |
| title_es | text | sí |  |  |
| title_en | text | sí |  |  |
| title | text | sí |  |  |
| description_es | text | sí |  |  |
| description_en | text | sí |  |  |
| description | text | sí |  |  |
| slug | text | sí |  |  |
| image_url | text | sí |  |  |
| project_url | text | sí |  |  |
| client | text | sí |  |  |
| company_id | uuid | sí |  | FK → companies.id |
| project_type | text | sí |  |  |
| status | text | sí | `planning` |  |
| created_at | timestamp with time zone | sí | `now()` |  |
| updated_at | timestamp with time zone | sí | `now()` |  |
| github_repo_url | text | sí |  |  |
| github_owner | text | sí |  |  |
| github_repo_name | text | sí |  |  |
| github_enabled | boolean | sí | `false` |  |
| start_date | date | sí |  |  |
| end_date | date | sí |  |  |
| resources_url | text | sí |  |  |
| total_price | numeric | sí |  |  |
| currency | text | sí | `MXN` |  |
| stripe_payment_link_id | text | sí |  |  |
| stripe_payment_link_url | text | sí |  |  |
| stripe_enable_installments | boolean | sí | `false` |  |
| stripe_installment_options | text | sí |  |  |

## quotation_questions

| Columna | Tipo | Nulo | Default | Notas |
| --- | --- | --- | --- | --- |
| id | uuid | NO | `gen_random_uuid()` | PK |
| service_id | uuid | sí |  | FK → services.id |
| question_es | text | NO |  |  |
| question_en | text | NO |  |  |
| question_type | character varying | NO |  |  |
| options | jsonb | sí |  |  |
| base_price | numeric | sí | `0` |  |
| price_multiplier | numeric | sí | `1` |  |
| is_required | boolean | sí | `true` |  |
| order_index | integer | sí | `0` |  |
| created_at | timestamp with time zone | sí | `now()` |  |
| updated_at | timestamp with time zone | sí | `now()` |  |

## quotation_technologies

| Columna | Tipo | Nulo | Default | Notas |
| --- | --- | --- | --- | --- |
| id | uuid | NO | `gen_random_uuid()` | PK |
| quotation_id | uuid | NO |  | FK → quotations.id |
| technology_id | uuid | NO |  | FK → technologies.id |
| created_at | timestamp with time zone | sí | `now()` |  |

## quotations

| Columna | Tipo | Nulo | Default | Notas |
| --- | --- | --- | --- | --- |
| id | uuid | NO | `gen_random_uuid()` | PK |
| user_id | uuid | sí |  | FK → users_view.id |
| service_id | uuid | sí |  | FK → services.id |
| client_name | character varying | sí |  |  |
| client_email | character varying | sí |  |  |
| client_company | character varying | sí |  |  |
| answers | jsonb | NO |  |  |
| subtotal | numeric | NO |  |  |
| iva | numeric | NO |  |  |
| total | numeric | NO |  |  |
| status | character varying | sí | `pending` |  |
| notes | text | sí |  |  |
| valid_until | timestamp with time zone | sí |  |  |
| created_at | timestamp with time zone | sí | `now()` |  |
| updated_at | timestamp with time zone | sí | `now()` |  |
| title | character varying | sí |  |  |
| description | text | sí |  |  |
| client_phone | character varying | sí |  |  |
| final_price | numeric | sí |  |  |
| estimated_development_time | integer | sí |  |  |
| ai_recommendation | jsonb | sí |  |  |
| deal_id | uuid | sí |  | FK → deals.id |

## quotes

| Columna | Tipo | Nulo | Default | Notas |
| --- | --- | --- | --- | --- |
| id | uuid | NO | `gen_random_uuid()` | PK |
| folio | text | NO |  |  |
| status | text | NO | `draft` |  |
| lang | text | NO | `es` |  |
| contact_id | uuid | sí |  |  |
| company_id | uuid | sí |  |  |
| client_name | text | NO |  |  |
| client_company | text | sí |  |  |
| client_email | text | sí |  |  |
| client_rfc | text | sí |  |  |
| client_address | text | sí |  |  |
| title | text | NO |  |  |
| intro | text | sí |  |  |
| items | jsonb | NO |  |  |
| currency | text | NO | `MXN` |  |
| apply_iva | boolean | NO | `true` |  |
| payment | jsonb | NO |  |  |
| terms | jsonb | NO |  |  |
| notes | text | sí |  |  |
| valid_until | date | NO |  |  |
| token | text | NO |  |  |
| sent_at | timestamp with time zone | sí |  |  |
| accepted_at | timestamp with time zone | sí |  |  |
| accepted_name | text | sí |  |  |
| accepted_ip | text | sí |  |  |
| accepted_user_agent | text | sí |  |  |
| project_id | uuid | sí |  |  |
| created_by | uuid | sí |  |  |
| created_at | timestamp with time zone | NO | `timezone('utc'::text, now())` |  |
| updated_at | timestamp with time zone | NO | `timezone('utc'::text, now())` |  |
| features | jsonb | NO |  |  |

## reports

| Columna | Tipo | Nulo | Default | Notas |
| --- | --- | --- | --- | --- |
| id | uuid | NO | `gen_random_uuid()` | PK |
| user_id | uuid | sí |  | FK → users_view.id |
| report_type | character varying | NO |  |  |
| report_format | character varying | NO |  |  |
| file_url | text | sí |  |  |
| file_name | text | NO |  |  |
| file_size | integer | sí |  |  |
| generated_at | timestamp with time zone | sí | `now()` |  |
| created_at | timestamp with time zone | sí | `now()` |  |

## services

| Columna | Tipo | Nulo | Default | Notas |
| --- | --- | --- | --- | --- |
| id | uuid | NO | `gen_random_uuid()` | PK |
| title_es | text | sí |  |  |
| title_en | text | sí |  |  |
| title | text | sí |  |  |
| description_es | text | sí |  |  |
| description_en | text | sí |  |  |
| description | text | sí |  |  |
| slug | text | sí |  |  |
| image_url | text | sí |  |  |
| icon | text | sí |  |  |
| created_at | timestamp with time zone | sí | `now()` |  |
| updated_at | timestamp with time zone | sí | `now()` |  |
| benefits_es | jsonb | sí |  |  |
| benefits_en | jsonb | sí |  |  |
| category | text | sí | `technology` |  |

## technologies

| Columna | Tipo | Nulo | Default | Notas |
| --- | --- | --- | --- | --- |
| id | uuid | NO | `gen_random_uuid()` | PK |
| name | character varying | NO |  |  |
| name_es | character varying | sí |  |  |
| name_en | character varying | sí |  |  |
| description_es | text | sí |  |  |
| description_en | text | sí |  |  |
| category | jsonb | sí |  |  |
| website_url | character varying | sí |  |  |
| created_at | timestamp with time zone | sí | `now()` |  |
| updated_at | timestamp with time zone | sí | `now()` |  |
| logo_url | text | sí |  |  |

## technology_companies

| Columna | Tipo | Nulo | Default | Notas |
| --- | --- | --- | --- | --- |
| id | uuid | NO | `gen_random_uuid()` | PK |
| technology_id | uuid | NO |  | FK → technologies.id |
| company_name | character varying | NO |  |  |
| created_at | timestamp with time zone | sí | `now()` |  |
| logo_url | text | sí |  |  |

## testimonials

| Columna | Tipo | Nulo | Default | Notas |
| --- | --- | --- | --- | --- |
| id | uuid | NO | `gen_random_uuid()` | PK |
| company | text | sí |  |  |
| company_id | uuid | sí |  | FK → companies.id |
| content_es | text | sí |  |  |
| content_en | text | sí |  |  |
| content | text | sí |  |  |
| avatar_url | text | sí |  |  |
| created_at | timestamp with time zone | sí | `now()` |  |

## translation_logs

| Columna | Tipo | Nulo | Default | Notas |
| --- | --- | --- | --- | --- |
| id | uuid | NO | `gen_random_uuid()` | PK |
| user_id | uuid | sí |  | FK → users_view.id |
| characters_count | integer | NO |  |  |
| source_language | character varying | sí | `es` |  |
| target_language | character varying | sí | `en` |  |
| created_at | timestamp with time zone | sí | `now()` |  |

## user_profiles

| Columna | Tipo | Nulo | Default | Notas |
| --- | --- | --- | --- | --- |
| id | uuid | NO | `gen_random_uuid()` | PK |
| user_id | uuid | NO |  | FK → users_view.id |
| first_name | text | sí |  |  |
| last_name | text | sí |  |  |
| avatar_url | text | sí |  |  |
| created_at | timestamp with time zone | sí | `now()` |  |
| updated_at | timestamp with time zone | sí | `now()` |  |

## users_view

| Columna | Tipo | Nulo | Default | Notas |
| --- | --- | --- | --- | --- |
| id | uuid | sí |  | PK |
| email | character varying | sí |  |  |
| full_name | text | sí |  |  |
| first_name | text | sí |  |  |
| last_name | text | sí |  |  |
| role | text | sí |  |  |
| created_at | timestamp with time zone | sí |  |  |
| updated_at | timestamp with time zone | sí |  |  |

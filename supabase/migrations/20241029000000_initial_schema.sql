-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Users table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Project ideas table
create table public.project_ideas (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  difficulty_level text check (difficulty_level in ('beginner', 'intermediate', 'advanced')),
  domain text,
  technologies text[],
  features jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Saved projects table
create table public.saved_projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  project_id uuid references public.project_ideas(id) on delete cascade not null,
  notes text,
  status text check (status in ('planning', 'in_progress', 'completed', 'archived')) default 'planning',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, project_id)
);

-- API keys for users
create table public.api_keys (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  key_hash text not null,
  last_used_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone
);

-- User preferences
create table public.user_preferences (
  user_id uuid references auth.users(id) on delete cascade primary key,
  theme text default 'system',
  email_notifications boolean default true,
  newsletter boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better query performance
create index idx_project_ideas_user_id on public.project_ideas(user_id);
create index idx_saved_projects_user_id on public.saved_projects(user_id);
create index idx_saved_projects_project_id on public.saved_projects(project_id);
create index idx_api_keys_user_id on public.api_keys(user_id);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.project_ideas enable row level security;
alter table public.saved_projects enable row level security;
alter table public.api_keys enable row level security;
alter table public.user_preferences enable row level security;

-- Create policies for RLS
-- Profiles
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can update their own profile." on public.profiles
  for update using (auth.uid() = id);

-- Project Ideas
create policy "Users can view all project ideas" on public.project_ideas
  for select using (true);

create policy "Users can insert their own project ideas" on public.project_ideas
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own project ideas" on public.project_ideas
  for update using (auth.uid() = user_id);

create policy "Users can delete their own project ideas" on public.project_ideas
  for delete using (auth.uid() = user_id);

-- Saved Projects
create policy "Users can view their saved projects" on public.saved_projects
  for select using (auth.uid() = user_id);

create policy "Users can insert their saved projects" on public.saved_projects
  for insert with check (auth.uid() = user_id);

create policy "Users can update their saved projects" on public.saved_projects
  for update using (auth.uid() = user_id);

create policy "Users can delete their saved projects" on public.saved_projects
  for delete using (auth.uid() = user_id);

-- API Keys
create policy "Users can manage their own API keys" on public.api_keys
  for all using (auth.uid() = user_id);

-- User Preferences
create policy "Users can view their own preferences" on public.user_preferences
  for select using (auth.uid() = user_id);

create policy "Users can update their own preferences" on public.user_preferences
  for update using (auth.uid() = user_id);

-- Create a trigger to handle user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  
  insert into public.user_preferences (user_id)
  values (new.id);
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create a function to update the updated_at column
define trigger set_updated_at()
  returns trigger as $$
  begin
    new.updated_at = now();
    return new;
  end;
$$ language plpgsql;

-- Add updated_at triggers to all tables
create trigger handle_updated_at before update on public.profiles
  for each row execute procedure set_updated_at();

create trigger handle_updated_at before update on public.project_ideas
  for each row execute procedure set_updated_at();

create trigger handle_updated_at before update on public.saved_projects
  for each row execute procedure set_updated_at();

create trigger handle_updated_at before update on public.api_keys
  for each row execute procedure set_updated_at();

create trigger handle_updated_at before update on public.user_preferences
  for each row execute procedure set_updated_at();

-- Create a function to generate a random API key
create or replace function public.generate_api_key(user_id uuid, key_name text, expires_in_days integer default null)
returns text as $$
declare
  new_key text;
  key_id uuid;
  expires_at_value timestamp with time zone;
begin
  -- Generate a random API key
  new_key := encode(gen_random_bytes(32), 'hex');
  
  -- Calculate expiration if needed
  if expires_in_days is not null then
    expires_at_value := now() + (expires_in_days * interval '1 day');
  end if;
  
  -- Insert the new API key
  insert into public.api_keys (user_id, name, key_hash, expires_at)
  values (user_id, key_name, crypt(new_key, gen_salt('bf')), expires_at_value)
  returning id into key_id;
  
  -- Return the plaintext key (only shown once)
  return key_id || '.' || new_key;
exception when others then
  raise exception 'Failed to generate API key: %', sqlerrm;
end;
$$ language plpgsql security definer;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_ref TEXT UNIQUE NOT NULL,
    locale TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    account_type TEXT,
    balance NUMERIC(18,2),
    synced_at TIMESTAMPTZ
);

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    parent_id UUID REFERENCES categories(id),
    is_discretionary BOOLEAN
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES accounts(id),
    amount NUMERIC(18,2),
    direction TEXT,
    description TEXT,
    category_id UUID REFERENCES categories(id),
    txn_date DATE,
    source_ref TEXT
);

CREATE TABLE financial_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) UNIQUE,
    monthly_income NUMERIC(18,2),
    monthly_surplus NUMERIC(18,2),
    savings_rate NUMERIC(5,2),
    spend_personality TEXT,
    life_stage TEXT,
    computed_at TIMESTAMPTZ DEFAULT NOW()
);

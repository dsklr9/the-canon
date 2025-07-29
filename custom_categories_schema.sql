-- Custom category tracking for Other Rankings
CREATE TABLE custom_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES auth.users(id),
    usage_count INTEGER DEFAULT 0,
    is_approved BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category_name) -- Prevent duplicates
);

-- Add custom category reference to user_lists
ALTER TABLE user_lists ADD COLUMN custom_category_id UUID REFERENCES custom_categories(id);

-- RLS policies for custom categories
ALTER TABLE custom_categories ENABLE ROW LEVEL SECURITY;

-- Everyone can view approved categories
CREATE POLICY "Approved categories are viewable by everyone" ON custom_categories 
    FOR SELECT USING (is_approved = true);

-- Users can create new categories
CREATE POLICY "Users can create categories" ON custom_categories 
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Users can update their own categories
CREATE POLICY "Users can update their own categories" ON custom_categories 
    FOR UPDATE USING (auth.uid() = created_by);

-- Function to increment usage count when someone creates a list
CREATE OR REPLACE FUNCTION increment_category_usage()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.custom_category_id IS NOT NULL THEN
        UPDATE custom_categories 
        SET usage_count = usage_count + 1,
            updated_at = NOW()
        WHERE id = NEW.custom_category_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_custom_list_created
    AFTER INSERT ON user_lists
    FOR EACH ROW
    EXECUTE FUNCTION increment_category_usage();

-- Insert the 3 starter categories
INSERT INTO custom_categories (category_name, description, usage_count, is_approved) VALUES
('Most Underrated', 'Artists who don''t get the recognition they deserve', 0, true),
('Most Overrated', 'Artists who get more credit than they deserve', 0, true),
('Best in the Game (right now)', 'The hottest artists dominating hip-hop today', 0, true);

-- Function to get or create custom category
CREATE OR REPLACE FUNCTION get_or_create_custom_category(
    category_name_param VARCHAR(100),
    user_id_param UUID,
    description_param TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    category_id UUID;
BEGIN
    -- Try to find existing category (case insensitive)
    SELECT id INTO category_id
    FROM custom_categories 
    WHERE LOWER(category_name) = LOWER(category_name_param)
    AND is_approved = true;
    
    -- If not found, create new category
    IF category_id IS NULL THEN
        INSERT INTO custom_categories (category_name, description, created_by)
        VALUES (category_name_param, description_param, user_id_param)
        RETURNING id INTO category_id;
    END IF;
    
    RETURN category_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get popular categories for dropdown
CREATE OR REPLACE FUNCTION get_popular_categories(limit_count INTEGER DEFAULT 20)
RETURNS TABLE(
    id UUID,
    category_name VARCHAR(100),
    description TEXT,
    usage_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT cc.id, cc.category_name, cc.description, cc.usage_count, cc.created_at
    FROM custom_categories cc
    WHERE cc.is_approved = true
    ORDER BY cc.usage_count DESC, cc.created_at ASC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
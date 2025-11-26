-- 步骤1：添加操作追踪字段
-- 执行此脚本添加必要的字段到 members 表

DO $$
BEGIN
    -- 添加创建者字段
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'members'
        AND column_name = 'created_by'
        AND table_schema = 'public'
    ) THEN
        EXECUTE format('ALTER TABLE members ADD COLUMN IF NOT EXISTS %I UUID REFERENCES auth.users(id)', 'created_by');
        RAISE NOTICE '✅ 已添加 created_by 字段';
    END IF;

    -- 添加更新者字段
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'members'
        AND column_name = 'updated_by'
        AND table_schema = 'public'
    ) THEN
        EXECUTE format('ALTER TABLE members ADD COLUMN IF NOT EXISTS %I UUID REFERENCES auth.users(id)', 'updated_by');
        RAISE NOTICE '✅ 已添加 updated_by 字段';
    END IF;

    -- 添加操作历史字段
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'members'
        AND column_name = 'operation_history'
        AND table_schema = 'public'
    ) THEN
        EXECUTE format('ALTER TABLE members ADD COLUMN IF NOT EXISTS %I JSONB DEFAULT %L', 'operation_history', '''[]''::jsonb');
        RAISE NOTICE '✅ 已添加 operation_history 字段';
    END IF;
END $$;
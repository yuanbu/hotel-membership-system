-- 步骤5：创建索引（修复版）

-- 为 members 表创建索引
CREATE INDEX IF NOT EXISTS idx_members_created_by ON members(created_by);
CREATE INDEX IF NOT EXISTS idx_members_updated_by ON members(updated_by);
CREATE INDEX IF NOT EXISTS idx_members_created_at ON members(created_at);
CREATE INDEX IF NOT EXISTS idx_members_updated_at ON members(updated_at);
CREATE INDEX IF NOT EXISTS idx_members_employee_id ON members(employee_id);

-- 为 activity_logs 表创建索引
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_target_type ON activity_logs(target_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

DO $$
BEGIN
    RAISE NOTICE '✅ 已创建所有索引';
END $$;

DO $$
BEGIN
    RAISE NOTICE '🎉 多用户协作功能配置完成！';
END $$;

DO $$
BEGIN
    RAISE NOTICE '📋 配置完成，现在可以测试多用户协作功能！';
END $$;
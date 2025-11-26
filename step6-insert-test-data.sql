-- 步骤6：插入测试数据（可选）

-- 插入一些测试员工数据（如果表为空）
DO $$
BEGIN
    -- 只有在没有数据时才插入测试数据
    IF NOT EXISTS (SELECT 1 FROM members LIMIT 1) THEN
        INSERT INTO members (employee_id, employee_name, employee_salary)
        VALUES
        (1001, '张三', 8000),
        (1002, '李四', 7500),
        (1003, '王五', 9000);
        RAISE NOTICE '✅ 已插入测试员工数据';
    ELSE
        RAISE NOTICE 'ℹ️ 员工表已有数据，跳过测试数据插入';
    END IF;
END $$;

DO $$
BEGIN
    RAISE NOTICE '🎉 多用户协作功能配置完成！';
END $$;

DO $$
BEGIN
    RAISE NOTICE '📋 接下来的步骤：';
END $$;

DO $$
BEGIN
    RAISE NOTICE '1. 在 Supabase 控制台启用 Database → Replication';
END $$;

DO $$
BEGIN
    RAISE NOTICE '2. 启用 members 表的实时同步';
END $$;

DO $$
BEGIN
    RAISE NOTICE '3. 启用 activity_logs 表的实时同步（可选）';
END $$;

DO $$
BEGIN
    RAISE NOTICE '4. 测试多用户登录和协作功能';
END $$;

DO $$
BEGIN
    RAISE NOTICE '';
END $$;

DO $$
BEGIN
    RAISE NOTICE '⚠️  注意事项：';
END $$;

DO $$
BEGIN
    RAISE NOTICE '1. 确保 Authentication → Settings 中启用了 Email confirmations';
END $$;

DO $$
BEGIN
    RAISE NOTICE '2. 设置正确的 Site URL 和 Redirect URLs';
END $$;

DO $$
BEGIN
    RAISE NOTICE '3. 如果在生产环境，请使用 HTTPS';
END $$;
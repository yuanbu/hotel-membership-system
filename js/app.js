// Supabase 配置
const SUPABASE_URL = 'https://xlamtnjlxzulahvumafh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsYW10bmpseHp1bGFodnVtYWZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5NjYzMTYsImV4cCI6MjA3OTU0MjMxNn0.CbHe3A7qQYbMseUVmPUD3FBzSOmCR7OgFDmAtJIkHkw';

// 初始化 Supabase 客户端
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 全局变量
let currentUser = null;

// DOM 元素
const loading = document.getElementById('loading');
const message = document.getElementById('message');

// 工具函数
function showLoading() {
    loading.classList.remove('hidden');
}

function hideLoading() {
    loading.classList.add('hidden');
}

function showMessage(text, type = 'info') {
    message.textContent = text;
    message.className = `message ${type} show`;

    setTimeout(() => {
        message.classList.remove('show');
    }, 3000);
}

// 选项卡切换功能
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');

            // 移除所有活动状态
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // 添加当前活动状态
            button.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
}

// 增加员工功能
async function addMember(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const employeeData = {
        employee_id: parseInt(formData.get('memberId').trim()) || 0,
        employee_name: formData.get('memberName').trim(),
        employee_salary: parseInt(formData.get('memberPoints')) || 0,
        created_by: currentUser?.id
    };

    if (!employeeData.employee_name || employeeData.employee_id <= 0) {
        showMessage('请填写完整的员工信息（员工ID必须为正数）', 'error');
        return;
    }

    showLoading();

    try {
        // 检查员工ID是否已存在
        const { data: existingEmployee } = await supabase
            .from('members')
            .select('employee_id')
            .eq('employee_id', employeeData.employee_id)
            .single();

        if (existingEmployee) {
            showMessage('员工ID已存在，请使用其他ID', 'error');
            hideLoading();
            return;
        }

        // 插入新员工
        const { data, error } = await supabase
            .from('members')
            .insert([employeeData])
            .select();

        if (error) {
            throw error;
        }

        showMessage(`员工 ${employeeData.employee_name} 添加成功！`, 'success');

        // 记录活动日志
        await logActivity('CREATE', 'employee', employeeData.employee_id.toString(), {
            employee_name: employeeData.employee_name,
            employee_salary: employeeData.employee_salary
        });

        event.target.reset();
        await loadMembersList();

    } catch (error) {
        console.error('添加员工失败:', error);
        showMessage('添加员工失败: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// 查询员工功能
async function searchMember(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const employeeId = formData.get('searchId')?.trim();

    if (!employeeId) {
        showMessage('请输入员工ID', 'error');
        return;
    }

    showLoading();

    try {
        const { data, error } = await supabase
            .from('members')
            .select('*')
            .eq('employee_id', employeeId)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        const resultDiv = document.getElementById('search-result');

        if (data) {
            resultDiv.innerHTML = `
                <div class="member-info">
                    <h3>员工信息</h3>
                    <p><strong>员工ID:</strong> ${data.employee_id}</p>
                    <p><strong>姓名:</strong> ${data.employee_name}</p>
                    <p><strong>薪资:</strong> ${data.employee_salary}</p>
                    <p><strong>创建时间:</strong> ${data.created_at ? new Date(data.created_at).toLocaleString('zh-CN') : '未知'}</p>
                    <p><strong>更新时间:</strong> ${data.updated_at ? new Date(data.updated_at).toLocaleString('zh-CN') : '未知'}</p>
                </div>
            `;
        } else {
            resultDiv.innerHTML = `
                <div class="empty-state">
                    <h3>未找到员工</h3>
                    <p>员工ID "${employeeId}" 不存在，请检查输入是否正确</p>
                </div>
            `;
        }

    } catch (error) {
        console.error('查询员工失败:', error);
        showMessage('查询员工失败: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// 查找编辑员工
async function searchEditMember(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const employeeId = formData.get('editSearchId')?.trim();

    if (!employeeId) {
        showMessage('请输入员工ID', 'error');
        return;
    }

    showLoading();

    try {
        const { data, error } = await supabase
            .from('members')
            .select('*')
            .eq('employee_id', employeeId)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        const resultDiv = document.getElementById('edit-result');

        if (data) {
            resultDiv.innerHTML = `
                <div class="member-info">
                    <h3>编辑员工薪资</h3>
                    <p><strong>员工ID:</strong> ${data.employee_id}</p>
                    <p><strong>姓名:</strong> ${data.employee_name}</p>
                    <p><strong>当前薪资:</strong> ${data.employee_salary}</p>

                    <form class="edit-form" id="update-points-form">
                        <input type="hidden" name="employeeId" value="${data.employee_id}">
                        <div class="form-group">
                            <label for="new-points">新薪资:</label>
                            <input type="number" id="new-points" name="newPoints" value="${data.employee_salary}" min="0" required>
                        </div>
                        <button type="submit" class="btn btn-success">更新薪资</button>
                    </form>
                </div>
            `;

            // 绑定更新薪资表单事件
            document.getElementById('update-points-form').addEventListener('submit', updateMemberPoints);
        } else {
            resultDiv.innerHTML = `
                <div class="empty-state">
                    <h3>未找到员工</h3>
                    <p>员工ID "${employeeId}" 不存在，请检查输入是否正确</p>
                </div>
            `;
        }

    } catch (error) {
        console.error('查找员工失败:', error);
        showMessage('查找员工失败: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// 更新员工薪资
async function updateMemberPoints(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const employeeId = formData.get('employeeId');
    const newSalary = parseInt(formData.get('newPoints'));

    showLoading();

    try {
        const { data, error } = await supabase
            .from('members')
            .update({
                employee_salary: newSalary,
                updated_by: currentUser?.id,
                updated_at: new Date().toISOString()
            })
            .eq('employee_id', employeeId)
            .select()
            .single();

        if (error) {
            throw error;
        }

        showMessage(`员工 ${data.employee_name} 的薪资已更新为 ${newSalary}`, 'success');

        // 记录活动日志
        await logActivity('UPDATE', 'employee', data.employee_id.toString(), {
            employee_name: data.employee_name,
            old_salary: data.employee_salary,
            new_salary: newSalary
        });

        // 清空编辑结果
        document.getElementById('edit-result').innerHTML = '';
        event.target.reset();

        await loadMembersList();

    } catch (error) {
        console.error('更新薪资失败:', error);
        showMessage('更新薪资失败: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// 查找删除员工
async function searchDeleteMember(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const employeeId = formData.get('deleteSearchId')?.trim();

    if (!employeeId) {
        showMessage('请输入员工ID', 'error');
        return;
    }

    showLoading();

    try {
        const { data, error } = await supabase
            .from('members')
            .select('*')
            .eq('employee_id', employeeId)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        const resultDiv = document.getElementById('delete-result');

        if (data) {
            resultDiv.innerHTML = `
                <div class="member-info">
                    <h3>确认删除员工</h3>
                    <p><strong>员工ID:</strong> ${data.employee_id}</p>
                    <p><strong>姓名:</strong> ${data.employee_name}</p>
                    <p><strong>薪资:</strong> ${data.employee_salary}</p>

                    <div class="action-buttons">
                        <button class="btn btn-danger" onclick="confirmDeleteMember('${data.employee_id}', '${data.employee_name}')">
                            确认删除
                        </button>
                        <button class="btn btn-secondary" onclick="cancelDelete()">
                            取消
                        </button>
                    </div>
                </div>
            `;
        } else {
            resultDiv.innerHTML = `
                <div class="empty-state">
                    <h3>未找到员工</h3>
                    <p>员工ID "${employeeId}" 不存在，请检查输入是否正确</p>
                </div>
            `;
        }

    } catch (error) {
        console.error('查找员工失败:', error);
        showMessage('查找员工失败: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// 确认删除员工
async function confirmDeleteMember(employeeId, employeeName) {
    if (!confirm(`确定要删除员工 "${employeeName}" (ID: ${employeeId}) 吗？此操作不可恢复！`)) {
        return;
    }

    showLoading();

    try {
        const { error } = await supabase
            .from('members')
            .delete()
            .eq('employee_id', employeeId);

        if (error) {
            throw error;
        }

        showMessage(`员工 ${employeeName} 已成功删除`, 'success');

        // 获取员工信息用于日志记录
        const { data: employeeData } = await supabase
            .from('members')
            .select('employee_salary')
            .eq('employee_id', employeeId)
            .single();

        // 记录活动日志
        await logActivity('DELETE', 'employee', employeeId, {
            employee_name: employeeName,
            employee_salary: employeeData?.employee_salary || 0
        });

        // 清空删除结果
        document.getElementById('delete-result').innerHTML = '';
        document.getElementById('search-delete-form').reset();

        await loadMembersList();

    } catch (error) {
        console.error('删除员工失败:', error);
        showMessage('删除员工失败: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// 取消删除
function cancelDelete() {
    document.getElementById('delete-result').innerHTML = '';
    document.getElementById('search-delete-form').reset();
}

// 加载会员列表
async function loadMembersList() {
    const tbody = document.getElementById('members-tbody');

    showLoading();

    try {
        const { data, error } = await supabase
            .from('members')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        if (data && data.length > 0) {
            tbody.innerHTML = data.map(employee => {
                const createdBy = employee.created_by === currentUser?.id ? '我' : '其他用户';
                const updatedBy = employee.updated_by === currentUser?.id ? '我' : '其他用户';

                return `
                    <tr>
                        <td>${employee.employee_id}</td>
                        <td>${employee.employee_name}</td>
                        <td>${employee.employee_salary}</td>
                        <td>${employee.created_at ? new Date(employee.created_at).toLocaleString('zh-CN') : '未知'}</td>
                        <td>${createdBy}</td>
                        <td>${employee.updated_at ? new Date(employee.updated_at).toLocaleString('zh-CN') : '未更新'}</td>
                        <td>${updatedBy}</td>
                    </tr>
                `;
            }).join('');
        } else {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <p>暂无员工数据</p>
                    </td>
                </tr>
            `;
        }

    } catch (error) {
        console.error('加载员工列表失败:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <p>加载失败: ${error.message}</p>
                </td>
            </tr>
        `;
    } finally {
        hideLoading();
    }
}

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    // 检查用户认证状态
    checkAuthentication();

    // 初始化选项卡
    initTabs();

    // 绑定表单事件
    document.getElementById('add-member-form').addEventListener('submit', addMember);
    document.getElementById('search-member-form').addEventListener('submit', searchMember);
    document.getElementById('search-edit-form').addEventListener('submit', searchEditMember);
    document.getElementById('search-delete-form').addEventListener('submit', searchDeleteMember);
    document.getElementById('refresh-list').addEventListener('click', loadMembersList);

    // 绑定登出按钮（如果存在）
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // 监听认证状态变化
    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
            currentUser = session.user;
            updateUserDisplay();
            loadMembersList();
            setupRealtimeSubscriptions();
        } else if (event === 'SIGNED_OUT') {
            currentUser = null;
            // 跳转到登录页面
            window.location.href = 'login.html';
        }
    });
});

// 检查用户认证状态
async function checkAuthentication() {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
        console.error('获取会话失败:', error);
        window.location.href = 'login.html';
        return;
    }

    if (!session || !session.user) {
        // 用户未登录，跳转到登录页面
        window.location.href = 'login.html';
        return;
    }

    currentUser = session.user;
    updateUserDisplay();
    showMessage('欢迎回来，' + (currentUser.user_metadata?.display_name || currentUser.email) + '！', 'success');

    // 记录登录活动
    await logLoginActivity();

    // 初始加载会员列表
    loadMembersList();

    // 测试 Supabase 连接
    testSupabaseConnection();
}

// 更新用户显示信息
function updateUserDisplay() {
    const userNameElement = document.getElementById('current-user-name');
    const userEmailElement = document.getElementById('current-user-email');

    if (currentUser) {
        const displayName = currentUser.user_metadata?.display_name || currentUser.email;
        if (userNameElement) {
            userNameElement.textContent = displayName;
        }
        if (userEmailElement) {
            userEmailElement.textContent = currentUser.email;
        }
    }
}

// 处理登出
async function handleLogout() {
    if (confirm('确定要退出登录吗？')) {
        showLoading();

        try {
            // 记录登出活动
            await logLogoutActivity();

            const { error } = await supabase.auth.signOut();

            if (error) {
                throw error;
            }

            showMessage('已成功退出登录', 'success');

        } catch (error) {
            console.error('登出失败:', error);
            showMessage('登出失败: ' + error.message, 'error');
        } finally {
            hideLoading();
        }
    }
}

// 设置实时订阅
function setupRealtimeSubscriptions() {
    // 订阅 members 表的实时变化
    const membersSubscription = supabase
        .channel('members-changes')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'members' },
            (payload) => {
                handleRealtimeChange(payload);
            }
        )
        .subscribe();

    // 订阅用户活动（可选）
    const activitySubscription = supabase
        .channel('user-activity')
        .on('presence', { event: 'sync' }, (event) => {
            updateActiveUsers(event.presences);
        })
        .subscribe();
}

// 处理实时数据变化
function handleRealtimeChange(payload) {
    const { eventType, new: newRecord, old: oldRecord, errors } = payload;

    if (errors && errors.length > 0) {
        console.error('Realtime error:', errors);
        return;
    }

    let message = '';
    const currentUserEmail = currentUser?.email;

    // 获取操作者的显示名称
    const getUserName = (userId) => {
        if (userId === currentUser?.id) return '我';
        // 这里可以从用户表获取详细信息，暂时使用简单判断
        return '其他用户';
    };

    switch (eventType) {
        case 'INSERT':
            message = `${getUserName(newRecord.created_by)} 添加了新员工 ${newRecord.employee_name}`;
            break;
        case 'UPDATE':
            const isSelfUpdate = newRecord.updated_by === currentUser?.id;
            if (isSelfUpdate) {
                message = `您更新了员工 ${newRecord.employee_name} 的薪资`;
            } else {
                message = `${getUserName(newRecord.updated_by)} 更新了员工 ${newRecord.employee_name} 的信息`;
            }
            break;
        case 'DELETE':
            message = `${getUserName(oldRecord.created_by)} 删除了员工 ${oldRecord.employee_name}`;
            break;
    }

    if (message) {
        // 显示实时通知
        showRealtimeNotification(message);

        // 如果不是自己的操作，自动刷新列表
        const isSelfOperation =
            (eventType === 'INSERT' && newRecord.created_by === currentUser?.id) ||
            (eventType === 'UPDATE' && newRecord.updated_by === currentUser?.id) ||
            (eventType === 'DELETE' && oldRecord.created_by === currentUser?.id);

        if (!isSelfOperation) {
            loadMembersList();
        }
    }
}

// 显示实时通知
function showRealtimeNotification(message) {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = 'realtime-notification';
    notification.textContent = message;

    // 添加到页面
    document.body.appendChild(notification);

    // 显示动画
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // 3秒后自动消失
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// 更新活跃用户列表
function updateActiveUsers(presences) {
    const activeUsersElement = document.getElementById('active-users');
    if (!activeUsersElement) return;

    const uniqueUsers = [...new Set(presences.map(p => p.user.email))].filter(email => email);

    if (uniqueUsers.length > 0) {
        activeUsersElement.innerHTML = `
            <div class="active-users-info">
                <span class="online-indicator">🟢</span>
                <span>在线用户: ${uniqueUsers.length}</span>
                <div class="users-list">
                    ${uniqueUsers.map(email => `<span class="user-item">${email}</span>`).join('')}
                </div>
            </div>
        `;
    }
}

// 记录用户活动
async function logActivity(action, targetType, targetId, details = {}) {
    if (!currentUser) return;

    try {
        const { error } = await supabase
            .from('activity_logs')
            .insert({
                user_id: currentUser.id,
                user_email: currentUser.email,
                action: action,
                target_type: targetType,
                target_id: targetId,
                details: details
            });

        if (error) {
            console.error('记录活动日志失败:', error);
        }
    } catch (error) {
        console.error('活动日志异常:', error);
    }
}

// 记录登录活动
async function logLoginActivity() {
    await logActivity('LOGIN', 'system', 'auth', {
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString()
    });
}

// 记录登出活动
async function logLogoutActivity() {
    await logActivity('LOGOUT', 'system', 'auth', {
        timestamp: new Date().toISOString()
    });
}

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    // 检查用户认证状态
    checkAuthentication();

    // 绑定表单事件
    document.getElementById('add-member-form').addEventListener('submit', addMember);
    document.getElementById('search-member-form').addEventListener('submit', searchMember);
    document.getElementById('search-edit-form').addEventListener('submit', searchEditMember);
    document.getElementById('logout-btn').addEventListener('click', logout);

    // 监听认证状态变化
    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
            currentUser = session.user;
            updateUserDisplay();
            loadMembersList();
            setupRealtimeSubscriptions();
        } else if (event === 'SIGNED_OUT') {
            currentUser = null;
            // 跳转到登录页面
            window.location.href = 'login.html';
        }
    });
});

// 测试 Supabase 连接
async function testSupabaseConnection() {
    try {
        const { data, error } = await supabase
            .from('members')
            .select('count')
            .limit(1);

        if (error) {
            console.error('Supabase 连接测试失败:', error);
            showMessage('数据库连接失败，请检查配置', 'error');
        } else {
            showMessage('系统已就绪', 'success');
        }
    } catch (error) {
        console.error('Supabase 连接测试异常:', error);
        showMessage('数据库连接异常', 'error');
    }
}
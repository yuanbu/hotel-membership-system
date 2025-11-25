// Supabase 配置
const SUPABASE_URL = 'https://xlamtnjlxzulahvumafh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsYW10bmpseHp1bGFodnVtYWZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5NjYzMTYsImV4cCI6MjA3OTU0MjMxNn0.CbHe3A7qQYbMseUVmPUD3FBzSOmCR7OgFDmAtJIkHkw';

// 初始化 Supabase 客户端
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
        employee_salary: parseInt(formData.get('memberPoints')) || 0
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
            .update({ employee_salary: newSalary })
            .eq('employee_id', employeeId)
            .select()
            .single();

        if (error) {
            throw error;
        }

        showMessage(`员工 ${data.employee_name} 的薪资已更新为 ${newSalary}`, 'success');

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
            tbody.innerHTML = data.map(employee => `
                <tr>
                    <td>${employee.employee_id}</td>
                    <td>${employee.employee_name}</td>
                    <td>${employee.employee_salary}</td>
                    <td>${employee.created_at ? new Date(employee.created_at).toLocaleString('zh-CN') : '未知'}</td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="empty-state">
                        <p>暂无员工数据</p>
                    </td>
                </tr>
            `;
        }

    } catch (error) {
        console.error('加载员工列表失败:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-state">
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
    // Supabase 配置已完成，跳过配置检查

    // 初始化选项卡
    initTabs();

    // 绑定表单事件
    document.getElementById('add-member-form').addEventListener('submit', addMember);
    document.getElementById('search-member-form').addEventListener('submit', searchMember);
    document.getElementById('search-edit-form').addEventListener('submit', searchEditMember);
    document.getElementById('search-delete-form').addEventListener('submit', searchDeleteMember);
    document.getElementById('refresh-list').addEventListener('click', loadMembersList);

    // 初始加载会员列表
    loadMembersList();

    // 测试 Supabase 连接
    testSupabaseConnection();
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
// Supabase 配置
const SUPABASE_URL = 'https://xlamtnjlxzulahvumafh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsYW10bmpseHp1bGFodnVtYWZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5NjYzMTYsImV4cCI6MjA3OTU0MjMxNn0.CbHe3A7qQYbMseUVmPUD3FBzSOmCR7OgFDmAtJIkHkw';

// 初始化 Supabase 客户端
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 全局变量
let currentLoginEmail = '';

// DOM 元素
const loading = document.getElementById('loading');
const message = document.getElementById('message');

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    // 检查用户是否已登录
    checkUserSession();

    // 初始化登录表单验证码
    generateCaptcha('login-captcha-display', 'login-captcha-answer');

    // 初始化注册表单验证码
    generateCaptcha('register-captcha-display', 'register-captcha-answer');

    // 初始化验证码输入框
    initCodeInputs();

    // 绑定表单事件
    document.getElementById('login-form-element').addEventListener('submit', handleLogin);
    document.getElementById('register-form-element').addEventListener('submit', handleRegister);
    document.getElementById('forgot-form-element').addEventListener('submit', handleForgotPassword);

    // 监听认证状态变化
    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
            // 用户已登录，跳转到主页面
            showMessage('登录成功！', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else if (event === 'SIGNED_OUT') {
            // 用户已登出
            showMessage('已退出登录', 'info');
        }
    });
});

// 检查用户会话
async function checkUserSession() {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (session && session.user) {
        // 用户已登录，直接跳转到主页面
        showMessage('欢迎回来！', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

// 生成随机验证码
function generateCaptcha(displayId, answerId) {
    const captcha = Math.floor(1000 + Math.random() * 9000).toString();
    const displayElement = document.getElementById(displayId);
    const answerElement = document.getElementById(answerId);

    if (displayElement) {
        displayElement.textContent = captcha;
        displayElement.style.transform = `rotate(${Math.random() * 10 - 5}deg)`;
    }

    if (answerElement) {
        answerElement.value = captcha;
    }
}

// 初始化验证码输入框
function initCodeInputs() {
    const codeInputContainers = document.querySelectorAll('.code-inputs');

    codeInputContainers.forEach(container => {
        const codeInputs = container.querySelectorAll('.code-input');
        const parentForm = container.closest('form');
        const submitBtn = parentForm.querySelector('button[type="submit"]');

        codeInputs.forEach((input, index) => {
            input.addEventListener('input', function(e) {
                const value = e.target.value;

                if (value.length === 1) {
                    // 自动跳到下一个输入框
                    if (index < codeInputs.length - 1) {
                        codeInputs[index + 1].focus();
                    }
                }

                // 验证当前表单的输入框是否都已填写
                const allFilled = Array.from(codeInputs).every(input => input.value.length === 1);
                if (submitBtn) {
                    submitBtn.disabled = !allFilled;
                }
            });

            input.addEventListener('keydown', function(e) {
                // 处理退格键
                if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
                    codeInputs[index - 1].focus();
                }
            });

            // 只允许输入数字
            input.addEventListener('input', function(e) {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
            });
        });
    });
}

// 处理登录
async function handleLogin(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const email = formData.get('email').trim();
    const password = formData.get('password');

    // 获取用户输入的验证码
    const userCaptcha = Array.from(document.querySelectorAll('#login-form .code-input'))
        .map(input => input.value)
        .join('');

    // 验证人机验证码
    const correctCaptcha = document.getElementById('login-captcha-answer').value;

    if (userCaptcha !== correctCaptcha) {
        showMessage('验证码错误，请重新输入', 'error');
        generateCaptcha('login-captcha-display', 'login-captcha-answer');
        clearCodeInputs('login-form');
        return;
    }

    if (!email || !password) {
        showMessage('请填写完整的登录信息', 'error');
        return;
    }

    showLoading();

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            throw error;
        }

        if (data.user && !data.user.email_confirmed_at) {
            showMessage('请先验证您的邮箱地址', 'warning');
            showVerificationForm();
            return;
        }

        showMessage('登录成功！', 'success');

    } catch (error) {
        console.error('登录失败:', error);
        let errorMessage = '登录失败';

        if (error.message.includes('Invalid login credentials')) {
            errorMessage = '邮箱或密码错误';
        } else if (error.message.includes('Email not confirmed')) {
            errorMessage = '请先验证您的邮箱地址';
            showVerificationForm();
            return;
        } else {
            errorMessage = error.message;
        }

        showMessage(errorMessage, 'error');
    } finally {
        hideLoading();
    }
}

// 清除验证码输入
function clearCodeInputs(formId) {
    const codeInputs = document.querySelectorAll(`#${formId} .code-input`);
    const parentForm = document.querySelector(`#${formId}`);
    const submitBtn = parentForm.querySelector('button[type="submit"]');

    codeInputs.forEach(input => input.value = '');

    // 重置按钮状态
    if (submitBtn) {
        submitBtn.disabled = true;
    }
}

// 处理注册
async function handleRegister(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const name = formData.get('name').trim();
    const email = formData.get('email').trim();
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    // 验证输入
    if (!name || !email || !password || !confirmPassword) {
        showMessage('请填写完整的注册信息', 'error');
        return;
    }

    if (password.length < 6) {
        showMessage('密码长度至少为6位', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showMessage('两次输入的密码不一致', 'error');
        return;
    }

    if (!document.getElementById('agree-terms').checked) {
        showMessage('请同意服务条款和隐私政策', 'error');
        return;
    }

    showLoading();

    try {
        // 注册用户
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    display_name: name
                }
            }
        });

        if (error) {
            throw error;
        }

        if (data.user && !data.user.email_confirmed_at) {
            showMessage('注册成功！请检查邮箱并完成验证', 'success');
            showVerificationForm();
        } else if (data.user) {
            showMessage('注册成功！', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }

    } catch (error) {
        console.error('注册失败:', error);
        let errorMessage = '注册失败';

        if (error.message.includes('User already registered')) {
            errorMessage = '该邮箱已被注册，请直接登录或找回密码';
        } else if (error.message.includes('Password should be at least')) {
            errorMessage = '密码长度至少为6位';
        } else {
            errorMessage = error.message;
        }

        showMessage(errorMessage, 'error');
    } finally {
        hideLoading();
    }
}

// 处理忘记密码
async function handleForgotPassword(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const email = formData.get('email').trim();

    if (!email) {
        showMessage('请输入您的邮箱地址', 'error');
        return;
    }

    showLoading();

    try {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password.html`
        });

        if (error) {
            throw error;
        }

        showMessage('密码重置链接已发送到您的邮箱', 'success');

        // 清空表单
        event.target.reset();

        // 2秒后返回登录页面
        setTimeout(() => {
            showLoginForm();
        }, 2000);

    } catch (error) {
        console.error('发送重置链接失败:', error);
        showMessage('发送重置链接失败: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// 重新发送验证邮件
async function resendVerification() {
    const email = document.getElementById('register-email').value.trim();

    if (!email) {
        showMessage('请先输入邮箱地址', 'error');
        showRegisterForm();
        return;
    }

    showLoading();

    try {
        const { data, error } = await supabase.auth.resend({
            type: 'signup',
            email: email
        });

        if (error) {
            throw error;
        }

        showMessage('验证邮件已重新发送', 'success');

    } catch (error) {
        console.error('重发验证邮件失败:', error);
        showMessage('重发验证邮件失败: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// 界面切换函数
function showLoginForm() {
    hideAllForms();
    document.getElementById('login-form').classList.remove('hidden');
    clearMessages();
}

function showRegisterForm() {
    hideAllForms();
    document.getElementById('register-form').classList.remove('hidden');
    clearMessages();
}

function showForgotPassword() {
    hideAllForms();
    document.getElementById('forgot-password-form').classList.remove('hidden');
    clearMessages();
}

function showVerificationForm() {
    hideAllForms();
    document.getElementById('verification-form').classList.remove('hidden');
}

function hideAllForms() {
    document.querySelectorAll('.auth-form-container').forEach(form => {
        form.classList.add('hidden');
    });
}

// 密码显示/隐藏切换
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling.querySelector('.eye-icon');

    if (input.type === 'password') {
        input.type = 'text';
        icon.textContent = '🙈';
    } else {
        input.type = 'password';
        icon.textContent = '👁️';
    }
}

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

function clearMessages() {
    message.classList.remove('show');
}

// 模态框函数
function showModal(title, content) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = content;
    document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}

function showTerms() {
    const termsContent = `
        <h4>服务条款</h4>
        <p><strong>1. 服务说明</strong></p>
        <p>欢迎使用酒店员工管理系统。本系统为内部员工管理工具，仅限授权人员使用。</p>

        <p><strong>2. 用户责任</strong></p>
        <p>用户有责任保护账户安全，不得将账户信息泄露给他人。如发现异常登录，请及时通知管理员。</p>

        <p><strong>3. 数据保护</strong></p>
        <p>我们将采取合理措施保护您的个人信息和员工数据安全。</p>

        <p><strong>4. 使用限制</strong></p>
        <p>禁止将本系统用于非法用途或违反公司政策的行为。</p>

        <p><strong>5. 条款修改</strong></p>
        <p>我们保留随时修改这些条款的权利。</p>
    `;
    showModal('服务条款', termsContent);
}

function showPrivacy() {
    const privacyContent = `
        <h4>隐私政策</h4>
        <p><strong>1. 信息收集</strong></p>
        <p>我们收集您的邮箱地址和姓名用于账户管理和身份验证。</p>

        <p><strong>2. 信息使用</strong></p>
        <p>您的个人信息仅用于系统登录、身份验证和员工管理功能。</p>

        <p><strong>3. 信息保护</strong></p>
        <p>我们采用加密技术和安全措施保护您的个人信息。</p>

        <p><strong>4. 信息共享</strong></p>
        <p>未经您的同意，我们不会与第三方共享您的个人信息。</p>

        <p><strong>5. 数据安全</strong></p>
        <p>我们定期备份数据并采取必要措施防止数据泄露。</p>
    `;
    showModal('隐私政策', privacyContent);
}

// 点击模态框背景关闭
document.getElementById('modal').addEventListener('click', function(event) {
    if (event.target === this) {
        closeModal();
    }
});
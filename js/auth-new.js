// Supabase 配置
const SUPABASE_URL = 'https://xlamtnjlxzulahvumafh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsYW10bmpseHp1bGFodnVtYWZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5NjYzMTYsImV4cCI6MjA3OTU0MjMxNn0.CbHe3A7qQYbMseUVmPUD3FBzSOmCR7OgFDmAtJIkHkw';

// 初始化 Supabase 客户端
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 全局变量
let currentStep = 1;
let currentEmail = '';
let verificationCode = '';
let resendTimer = null;

// DOM 元素
const loading = document.getElementById('loading');
const message = document.getElementById('message');

// 加载邮件服务
function loadEmailService() {
    const serviceSelect = document.getElementById('email-service-select');

    // 设置邮件服务类型
    const emailServiceType = localStorage.getItem('emailServiceType') || 'supabase';

    if (serviceSelect) {
        serviceSelect.value = emailServiceType;
    }

    // EmailService 已经通过 script 标签加载了，这里只需要设置类型
    if (window.EmailService) {
        window.EmailService.setServiceType(emailServiceType);
    }
}

// 切换邮件服务
function switchEmailService() {
    const serviceSelect = document.getElementById('email-service-select');
    const selectedType = serviceSelect.value;

    localStorage.setItem('emailServiceType', selectedType);

    // 重新初始化邮件服务
    if (window.EmailService) {
        window.EmailService.setServiceType(selectedType);

        const serviceNames = {
            'console': '控制台模式',
            'freeapi': '免费API模式',
            'supabase': 'Supabase邮件服务',
            'emailjs': 'EmailJS服务'
        };

        showMessage(`已切换到${serviceNames[selectedType] || selectedType}`, 'info');
    }
}

// 显示邮件服务配置信息
function showEmailServiceInfo() {
    const serviceType = localStorage.getItem('emailServiceType') || 'mock';
    const serviceStatus = window.EmailService ? window.EmailService.checkServiceStatus() : null;

    let content = '';
    if (serviceType === 'mock' || !serviceStatus) {
        content = `
            <h4>📧 邮件服务配置说明</h4>
            <p><strong>当前模式：</strong>模拟模式（仅用于开发测试）</p>
            <h5>🔧 配置真实邮件服务：</h5>
            <ol>
                <li>查看 <strong>EMAILJS_SETUP.md</strong> 文档</li>
                <li>注册 EmailJS 账户</li>
                <li>配置邮件服务（推荐Gmail）</li>
                <li>修改 js/email-service-real.js 中的配置</li>
                <li>切换到"真实邮件"模式</li>
            </ol>
            <h5>📋 测试说明：</h5>
            <p>在模拟模式下，验证码会显示在浏览器控制台中</p>
        `;
    } else {
        content = `
            <h4>📧 邮件服务状态</h4>
            <p><strong>服务类型：</strong>${serviceStatus.service}</p>
            <p><strong>配置状态：</strong>${serviceStatus.configured ? '✅ 已配置' : '❌ 未配置'}</p>
            <p><strong>发送能力：</strong>${serviceStatus.canSend ? '✅ 可以发送' : '❌ 无法发送'}</p>
            <p><strong>状态信息：</strong>${serviceStatus.message}</p>
        `;
    }

    showModal('邮件服务配置', content);
}

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    // 加载邮件服务
    loadEmailService();

    // 初始化验证码
    generateCaptcha('captcha-display', 'captcha-answer');
    generateCaptcha('login-captcha-display', 'login-captcha-answer');

    // 初始化验证码输入框
    initCodeInputs();

    // 初始化按钮状态
    initializeButtonStates();

    // 绑定表单事件
    document.getElementById('email-form-element').addEventListener('submit', handleEmailSubmit);
    document.getElementById('verification-form-element').addEventListener('submit', handleVerificationSubmit);
    document.getElementById('password-form-element').addEventListener('submit', handlePasswordSubmit);
    document.getElementById('login-form-element').addEventListener('submit', handleLoginSubmit);
});

// 生成随机验证码
function generateCaptcha(displayId, answerId) {
    const captcha = Math.floor(1000 + Math.random() * 9000).toString();
    const displayElement = document.getElementById(displayId);
    const answerElement = document.getElementById(answerId);

    if (displayElement) {
        displayElement.textContent = captcha;
        // 添加一些干扰效果
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

// 初始化按钮状态
function initializeButtonStates() {
    const codeInputContainers = document.querySelectorAll('.code-inputs');

    codeInputContainers.forEach(container => {
        const codeInputs = container.querySelectorAll('.code-input');
        const parentForm = container.closest('form');
        const submitBtn = parentForm.querySelector('button[type="submit"]');

        // 初始状态下按钮应该是禁用的
        if (submitBtn) {
            submitBtn.disabled = true;
        }
    });
}

// 步骤1：处理邮箱提交
async function handleEmailSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const email = formData.get('email').trim();
    const userCaptcha = Array.from(document.querySelectorAll('#email-step .code-input'))
        .map(input => input.value)
        .join('');
    const correctCaptcha = document.getElementById('captcha-answer').value;

    // 验证人机验证码
    if (userCaptcha !== correctCaptcha) {
        showMessage('验证码错误，请重新输入', 'error');
        generateCaptcha('captcha-display', 'captcha-answer');
        clearCodeInputs('email-step');
        return;
    }

    if (!email) {
        showMessage('请输入邮箱地址', 'error');
        return;
    }

    showLoading();

    try {
        // 直接发送邮件验证码，让系统自动处理新用户注册
        verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        // 使用邮件服务发送验证码
        const emailResult = await window.EmailService.sendVerificationCode(email, verificationCode);

        // 存储验证码到本地
        localStorage.setItem(`verification_${email}`, JSON.stringify({
            code: verificationCode,
            timestamp: Date.now()
        }));

        currentEmail = email;
        showVerificationStep();

        // 根据发送结果显示不同的消息
        if (emailResult.success && emailResult.method === 'console') {
            // 控制台模式：显示验证码给用户
            showMessage(`6位数验证码已生成，请在控制台查看：${verificationCode}`, 'info');
        } else if (emailResult.success) {
            // 真实邮件发送成功
            showMessage(emailResult.message || `验证码已发送到 ${email}`, 'success');
        } else {
            // 发送失败但验证码已生成
            showMessage(`验证码已生成，发送失败：${verificationCode}`, 'warning');
        }

    } catch (error) {
        console.error('邮箱验证失败:', error);
        showMessage('邮箱验证失败，请重试', 'error');
    } finally {
        hideLoading();
    }
}

// 步骤2：处理验证码提交
async function handleVerificationSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const inputCode = formData.get('email-verification-code').trim();

    // 调试信息
    console.log('🔍 开始验证邮箱验证码');
    console.log('📧 当前邮箱:', currentEmail);
    console.log('⌨️ 用户输入验证码:', inputCode);

    // 从本地存储获取验证码
    const storedData = localStorage.getItem(`verification_${currentEmail}`);
    console.log('💾 本地存储数据:', storedData);

    if (!storedData) {
        console.error('❌ 未找到验证码数据');
        showMessage('验证码已过期，请重新发送', 'error');
        return;
    }

    const { code: storedCode, timestamp } = JSON.parse(storedData);
    console.log('🔑 存储的验证码:', storedCode);
    console.log('⏰ 存储时间戳:', timestamp);

    // 检查验证码是否过期（10分钟）
    const timeDiff = Date.now() - timestamp;
    const timeLeft = 10 * 60 * 1000 - timeDiff;
    console.log('⏳ 时间差:', timeDiff, 'ms');
    console.log('⏰ 剩余时间:', timeLeft, 'ms');

    if (timeDiff > 10 * 60 * 1000) {
        localStorage.removeItem(`verification_${currentEmail}`);
        console.error('❌ 验证码已过期');
        showMessage('验证码已过期，请重新发送', 'error');
        return;
    }

    if (inputCode !== storedCode) {
        console.error('❌ 验证码不匹配');
        console.error('  输入:', inputCode);
        console.error('  期望:', storedCode);
        showMessage('验证码错误', 'error');
        return;
    }

    console.log('✅ 验证码匹配成功！');
    // 验证成功，进入下一步
    showPasswordStep();
    showMessage('邮箱验证成功', 'success');
}

// 步骤3：处理密码设置
async function handlePasswordSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const name = formData.get('name').trim();
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    const agreeTerms = document.getElementById('agree-terms').checked;

    // 验证输入
    if (!name || !password) {
        showMessage('请填写所有必填字段', 'error');
        return;
    }

    if (password.length < 6) {
        showMessage('密码至少需要6位字符', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showMessage('两次输入的密码不一致', 'error');
        return;
    }

    if (!agreeTerms) {
        showMessage('请同意服务条款和隐私政策', 'error');
        return;
    }

    showLoading();

    try {
        // 注册用户
        const { data, error } = await supabase.auth.signUp({
            email: currentEmail,
            password: password,
            options: {
                data: {
                    display_name: name,
                    email_verified: true // 手动标记为已验证
                }
            }
        });

        if (error) {
            throw error;
        }

        // 清理本地存储的验证码
        localStorage.removeItem(`verification_${currentEmail}`);

        showMessage('注册成功！正在跳转到主页面...', 'success');

        // 延迟跳转，让用户看到成功消息
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);

    } catch (error) {
        console.error('注册失败:', error);
        showMessage('注册失败: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// 处理直接登录
async function handleLoginSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const email = formData.get('email').trim();
    const password = formData.get('password');
    const userCaptcha = Array.from(document.querySelectorAll('#login-step .code-input'))
        .map(input => input.value)
        .join('');
    const correctCaptcha = document.getElementById('login-captcha-answer').value;

    // 验证人机验证码
    if (userCaptcha !== correctCaptcha) {
        showMessage('验证码错误，请重新输入', 'error');
        generateCaptcha('login-captcha-display', 'login-captcha-answer');
        clearCodeInputs('login-step');
        return;
    }

    if (!email || !password) {
        showMessage('请输入邮箱和密码', 'error');
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

        showMessage('登录成功！正在跳转...', 'success');

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);

    } catch (error) {
        console.error('登录失败:', error);
        showMessage('登录失败: ' + error.message, 'error');
        generateCaptcha('login-captcha-display', 'login-captcha-answer');
        clearCodeInputs('login-step');
    } finally {
        hideLoading();
    }
}

// 显示步骤的函数
function showEmailStep() {
    hideAllSteps();
    document.getElementById('email-step').classList.remove('hidden');
    updateStepIndicator(1);
    currentStep = 1;
}

function showVerificationStep() {
    hideAllSteps();
    document.getElementById('verification-step').classList.remove('hidden');
    updateStepIndicator(2);

    // 显示邮箱地址
    document.getElementById('email-display').textContent = currentEmail;

    // 启动重发计时器
    startResendTimer();

    currentStep = 2;
}

function showPasswordStep() {
    hideAllSteps();
    document.getElementById('password-step').classList.remove('hidden');
    updateStepIndicator(3);
    currentStep = 3;
}

function showLoginStep() {
    hideAllSteps();
    document.getElementById('login-step').classList.remove('hidden');
    currentStep = 'login';
}

// 显示注册流程
function showRegistrationFlow() {
    showEmailStep();
}

// 步骤指示器更新
function updateStepIndicator(step) {
    // 重置所有步骤
    document.querySelectorAll('.step').forEach(el => {
        el.classList.remove('active', 'completed');
    });

    // 标记当前步骤
    const currentStepEl = document.getElementById(`step${step}`);
    if (currentStepEl) {
        currentStepEl.classList.add('active');
    }

    // 标记已完成的步骤
    for (let i = 1; i < step; i++) {
        const completedStepEl = document.getElementById(`step${i}`);
        if (completedStepEl) {
            completedStepEl.classList.add('completed');
        }
    }
}

// 重发验证码
async function resendVerificationCode() {
    if (resendTimer) return; // 防止重复点击

    showLoading();

    try {
        verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        // 使用邮件服务发送验证码
        const emailResult = await window.EmailService.sendVerificationCode(currentEmail, verificationCode);

        // 更新本地存储
        localStorage.setItem(`verification_${currentEmail}`, JSON.stringify({
            code: verificationCode,
            timestamp: Date.now()
        }));

        startResendTimer();

        // 根据发送结果显示不同的消息
        if (emailResult.success && emailResult.method === 'console') {
            // 控制台模式：显示验证码给用户
            showMessage(`新的6位数验证码已生成，请在控制台查看：${verificationCode}`, 'info');
        } else if (emailResult.success) {
            // 真实邮件发送成功
            showMessage(emailResult.message || '验证码已重新发送', 'success');
        } else {
            // 发送失败但验证码已生成
            showMessage(`验证码已生成，发送失败：${verificationCode}`, 'warning');
        }

    } catch (error) {
        console.error('重发失败:', error);
        showMessage('重发失败，请重试', 'error');
    } finally {
        hideLoading();
    }
}

// 启动重发计时器
function startResendTimer() {
    let timeLeft = 60;
    const resendBtn = document.getElementById('resend-btn');
    const timerDisplay = document.getElementById('timer');

    resendBtn.disabled = true;
    timerDisplay.style.display = 'block';

    resendTimer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = `${timeLeft}秒后可重新发送`;

        if (timeLeft <= 0) {
            clearInterval(resendTimer);
            resendTimer = null;
            resendBtn.disabled = false;
            timerDisplay.style.display = 'none';
        }
    }, 1000);
}

// 清除验证码输入
function clearCodeInputs(stepId) {
    const codeInputs = document.querySelectorAll(`#${stepId} .code-input`);
    const parentForm = document.querySelector(`#${stepId}`);
    const submitBtn = parentForm.querySelector('button[type="submit"]');

    codeInputs.forEach(input => input.value = '');

    // 重置按钮状态
    if (submitBtn) {
        submitBtn.disabled = true;
    }
}

// 隐藏所有步骤
function hideAllSteps() {
    document.getElementById('email-step').classList.add('hidden');
    document.getElementById('verification-step').classList.add('hidden');
    document.getElementById('password-step').classList.add('hidden');
    document.getElementById('login-step').classList.add('hidden');
}

// 返回上一步
function goBackToEmail() {
    showEmailStep();
}

function goBackToVerification() {
    showVerificationStep();
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
    }, 5000);
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling.querySelector('.eye-icon');

    if (input.type === 'password') {
        input.type = 'text';
        icon.textContent = '👁️';
    } else {
        input.type = 'password';
        icon.textContent = '👁️';
    }
}

function showModal(title, content) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');

    modalBody.innerHTML = `
        <h3>${title}</h3>
        <div>${content}</div>
    `;

    modal.classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}

function showTerms() {
    showModal('服务条款', `
        <div style="max-height: 400px; overflow-y: auto;">
            <h4>1. 服务说明</h4>
            <p>本系统提供酒店员工管理服务，包括员工信息管理、数据统计等功能。</p>

            <h4>2. 用户责任</h4>
            <p>用户应当妥善保管账户信息，不得用于违法用途。</p>

            <h4>3. 数据隐私</h4>
            <p>我们承诺保护用户数据安全，不会未经授权分享个人信息。</p>

            <h4>4. 服务条款变更</h4>
            <p>我们保留随时修改服务条款的权利，重大变更会提前通知用户。</p>
        </div>
    `);
}

function showPrivacy() {
    showModal('隐私政策', `
        <div style="max-height: 400px; overflow-y: auto;">
            <h4>信息收集</h4>
            <p>我们收集必要的用户信息以提供服务，包括邮箱、姓名等基本信息。</p>

            <h4>信息使用</h4>
            <p>收集的信息仅用于系统功能实现，不会用于商业推广。</p>

            <h4>信息保护</h4>
            <p>采用行业标准加密技术保护用户数据安全。</p>

            <h4>Cookie使用</h4>
            <p>使用Cookie改善用户体验，可通过浏览器设置管理。</p>

            <h4>联系我们</h4>
            <p>如有隐私相关问题，请通过邮箱联系我们。</p>
        </div>
    `);
}

function showForgotPassword() {
    showModal('忘记密码', `
        <p>忘记密码功能正在开发中...</p>
        <p>请联系管理员重置密码。</p>
    `);
}
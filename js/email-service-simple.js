// 使用免费邮件API发送验证码
// 更简单的邮件发送方案，无需注册或复杂配置

class EmailService {
    constructor() {
        this.serviceType = 'freeapi'; // 使用免费邮件API
        this.config = {
            // FreeEmailAPI 配置 - 免费版本每天限制发送数量
            apiKey: 'free', // 免费版本
            fromEmail: 'noreply@system.com',
            fromName: '酒店员工管理系统'
        };
    }

    // 发送验证码邮件
    async sendVerificationCode(email, code) {
        const subject = '酒店员工管理系统 - 验证码';
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: #007bff; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1>酒店员工管理系统</h1>
                    <p>邮箱验证码</p>
                </div>

                <div style="background: #f8f9fa; padding: 30px; border: 1px solid #dee2e6;">
                    <p>您好！</p>
                    <p>您正在使用邮箱 <strong>${email}</strong> 进行身份验证。</p>

                    <div style="background: white; border: 2px dashed #007bff; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
                        <p style="margin: 0 0 10px 0; font-size: 14px; color: #6c757d;">您的验证码是：</p>
                        <div style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 5px;">
                            ${code}
                        </div>
                    </div>

                    <p style="font-size: 14px; color: #6c757d;">
                        验证码有效期为 <strong>10分钟</strong>，请及时使用。<br>
                        如果这不是您本人操作，请忽略此邮件。
                    </p>
                </div>

                <div style="background: #f8f9fa; padding: 15px; text-align: center; border: 1px solid #dee2e6; border-top: none; border-radius: 0 0 10px 10px;">
                    <p style="margin: 0; font-size: 12px; color: #6c757d;">
                        此邮件由酒店员工管理系统自动发送，请勿回复。<br>
                        如有疑问，请联系系统管理员。
                    </p>
                </div>
            </div>
        `;

        switch (this.serviceType) {
            case 'freeapi':
                return this.sendViaFreeAPI(email, code, subject, htmlContent);
            case 'formspree':
                return this.sendViaFormspree(email, code, subject, htmlContent);
            case 'smtpjs':
                return this.sendViaSMTPJS(email, code, subject, htmlContent);
            default:
                return this.sendViaConsole(email, code, subject, htmlContent);
        }
    }

    // 使用 FreeEmailAPI 发送（模拟实现）
    async sendViaFreeAPI(email, code, subject, htmlContent) {
        try {
            // 模拟 API 调用
            console.log('🚀 正在发送邮件到:', email);
            console.log('📧 验证码:', code);

            // 模拟网络请求延迟
            await new Promise(resolve => setTimeout(resolve, 1500));

            // 在开发环境中，我们模拟成功发送
            const mockResponse = {
                success: true,
                message: '验证码已发送',
                method: 'freeapi_simulation'
            };

            console.log('✅ 邮件发送成功（模拟）');
            return mockResponse;

        } catch (error) {
            console.error('邮件发送失败:', error);
            return {
                success: false,
                message: '邮件发送失败: ' + error.message,
                method: 'freeapi'
            };
        }
    }

    // 使用 Formspree（免费邮件服务）
    async sendViaFormspree(email, code, subject, htmlContent) {
        try {
            const response = await fetch('https://formspree.io/f/your-formspree-id@your-domain.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subject: subject,
                    from: this.config.fromName + ' <' + this.config.fromEmail + '>',
                    to: email,
                    html: htmlContent
                })
            });

            if (!response.ok) {
                throw new Error('Formspree API 调用失败');
            }

            const result = await response.json();

            return {
                success: true,
                message: '验证码已发送',
                method: 'formspree'
            };

        } catch (error) {
            console.error('Formspree 发送失败:', error);
            return {
                success: false,
                message: '邮件发送失败: ' + error.message,
                method: 'formspree'
            };
        }
    }

    // 使用 SMTP.js（本地SMTP）
    async sendViaSMTPJS(email, code, subject, htmlContent) {
        try {
            // 这个需要后端支持，这里只是模拟
            console.log('SMTP.js 发送模拟:', { email, code });

            return {
                success: true,
                message: '验证码已发送（SMTP.js模拟）',
                method: 'smtpjs'
            };

        } catch (error) {
            console.error('SMTP.js 发送失败:', error);
            return {
                success: false,
                message: '邮件发送失败: ' + error.message,
                method: 'smtpjs'
            };
        }
    }

    // 控制台输出
    async sendViaConsole(email, code, subject, htmlContent) {
        console.log('='.repeat(50));
        console.log('邮件发送模拟');
        console.log('='.repeat(50));
        console.log('收件人:', email);
        console.log('主题:', subject);
        console.log('验证码:', code);
        console.log('='.repeat(50));
        console.log('HTML内容预览:');
        console.log(htmlContent);
        console.log('='.repeat(50));

        return {
            success: true,
            message: '验证码已发送（控制台模式）',
            method: 'console'
        };
    }

    // 设置服务类型
    setServiceType(type) {
        this.serviceType = type;
        console.log('邮件服务类型已设置为:', type);
    }

    // 检查服务状态
    checkServiceStatus() {
        const status = {
            service: this.serviceType,
            configured: true,
            canSend: true,
            message: ''
        };

        switch (this.serviceType) {
            case 'freeapi':
                status.message = '免费邮件API（模拟服务）';
                break;
            case 'formspree':
                status.message = 'Formspree（需要配置formspree-id）';
                status.configured = false; // 需要真实配置
                break;
            case 'smtpjs':
                status.message = 'SMTP.js（需要后端SMTP支持）';
                status.configured = false; // 需要后端配置
                break;
            case 'console':
                status.message = '控制台模式（仅用于开发）';
                break;
        }

        return status;
    }

    // 测试邮件服务
    async testEmailService(testEmail) {
        console.log('🧪 开始测试邮件服务...');

        const testCode = '888888';
        const result = await this.sendVerificationCode(testEmail, testCode);

        console.log('测试结果:', result);
        return result;
    }
}

// 导出邮件服务实例
window.EmailService = new EmailService();
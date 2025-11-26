// 使用 EmailJS 实现真实邮件发送
// EmailJS 是一个免费的邮件服务，可以在前端直接发送邮件

class EmailService {
    constructor() {
        this.serviceType = 'emailjs'; // 使用 EmailJS 服务
        this.initEmailJS();
    }

    // 初始化 EmailJS
    initEmailJS() {
        // EmailJS 配置 - 需要在 EmailJS 官网注册获取
        this.emailjsConfig = {
            serviceID: 'your_service_id',     // 替换为您的服务ID
            templateID: 'your_template_id',   // 替换为您的模板ID
            publicKey: 'your_public_key'       // 替换为您的公钥
        };

        // 如果没有配置真实密钥，使用模拟模式
        if (this.emailjsConfig.serviceID === 'your_service_id') {
            this.serviceType = 'mock';
            console.log('EmailJS 未配置，使用模拟模式');
        } else {
            // 加载 EmailJS
            (function() {
                emailjs.init(this.emailjsConfig.publicKey);
            }).call(this);
        }
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
            case 'emailjs':
                return this.sendViaEmailJS(email, code, subject, htmlContent);
            case 'mock':
                return this.sendViaMock(email, code, subject, htmlContent);
            case 'supabase':
                return this.sendViaSupabase(email, subject, htmlContent);
            default:
                return this.sendViaConsole(email, code, subject, htmlContent);
        }
    }

    // 使用 EmailJS 发送邮件
    async sendViaEmailJS(email, code, subject, htmlContent) {
        try {
            const templateParams = {
                to_email: email,
                to_name: email.split('@')[0],
                verification_code: code,
                subject: subject,
                html_content: htmlContent
            };

            const result = await emailjs.send(
                this.emailjsConfig.serviceID,
                this.emailjsConfig.templateID,
                templateParams
            );

            if (result.status === 200) {
                return {
                    success: true,
                    message: '验证码已发送到您的邮箱',
                    method: 'emailjs'
                };
            } else {
                throw new Error(result.text || '邮件发送失败');
            }

        } catch (error) {
            console.error('EmailJS 发送失败:', error);
            return {
                success: false,
                message: '邮件发送失败: ' + error.message,
                method: 'emailjs'
            };
        }
    }

    // 模拟发送（用于测试）
    async sendViaMock(email, code, subject, htmlContent) {
        console.log('='.repeat(50));
        console.log('📧 邮件发送模拟');
        console.log('='.repeat(50));
        console.log('收件人:', email);
        console.log('主题:', subject);
        console.log('验证码:', code);
        console.log('='.repeat(50));

        // 模拟发送延迟
        await new Promise(resolve => setTimeout(resolve, 1000));

        return {
            success: true,
            message: '验证码已发送（模拟模式，请在控制台查看验证码）',
            method: 'mock'
        };
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
            message: '验证码已发送（开发模式）',
            method: 'console'
        };
    }

    // 使用 Supabase Edge Functions
    async sendViaSupabase(email, subject, htmlContent) {
        try {
            const { data, error } = await window.supabase.functions.invoke('send-email', {
                body: {
                    to: email,
                    subject: subject,
                    html: htmlContent
                }
            });

            if (error) throw error;

            return {
                success: true,
                message: '验证码已发送',
                method: 'supabase'
            };
        } catch (error) {
            console.error('Supabase邮件发送失败:', error);
            // 降级到控制台输出
            return this.sendViaConsole(email, code, subject, htmlContent);
        }
    }

    // 设置服务类型
    setServiceType(type) {
        this.serviceType = type;
        if (type === 'emailjs') {
            this.initEmailJS();
        }
    }

    // 检查邮件服务状态
    checkServiceStatus() {
        const status = {
            service: this.serviceType,
            configured: false,
            canSend: false
        };

        switch (this.serviceType) {
            case 'emailjs':
                status.configured = this.emailjsConfig.serviceID !== 'your_service_id';
                status.canSend = status.configured;
                status.message = status.configured ? 'EmailJS 已配置' : 'EmailJS 未配置，请查看 js/email-service-real.js';
                break;
            case 'mock':
                status.configured = true;
                status.canSend = true;
                status.message = '模拟邮件服务（仅用于测试）';
                break;
            case 'console':
                status.configured = true;
                status.canSend = true;
                status.message = '控制台模式（仅用于开发）';
                break;
            case 'supabase':
                status.configured = false;
                status.canSend = false;
                status.message = 'Supabase Edge Functions 未配置';
                break;
        }

        return status;
    }
}

// 导出邮件服务实例
window.EmailService = new EmailService();
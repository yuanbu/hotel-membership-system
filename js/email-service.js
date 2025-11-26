// 邮件发送服务 - 使用 Supabase Edge Functions 或第三方服务
// 由于这是一个演示版本，我们使用几种备选方案

class EmailService {
    constructor() {
        // 可以配置不同的邮件服务
        this.serviceType = 'console'; // 'console', 'supabase', 'third-party'
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
            case 'console':
                return this.sendViaConsole(email, code, subject, htmlContent);
            case 'supabase':
                return this.sendViaSupabase(email, subject, htmlContent);
            case 'third-party':
                return this.sendViaThirdParty(email, subject, htmlContent);
            default:
                return this.sendViaConsole(email, code, subject, htmlContent);
        }
    }

    // 控制台输出（开发测试用）
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

    // 使用 Supabase Edge Functions 发送邮件
    async sendViaSupabase(email, subject, htmlContent) {
        try {
            const { data, error } = await supabase.functions.invoke('send-email', {
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

    // 使用第三方邮件服务（如 Resend, SendGrid 等）
    async sendViaThirdParty(email, subject, htmlContent) {
        // 这里可以集成 Resend, SendGrid, AWS SES 等服务
        // 示例使用 Resend
        try {
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': 're_your_api_key', // 需要替换为真实的API密钥
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: 'noreply@yourdomain.com',
                    to: [email],
                    subject: subject,
                    html: htmlContent
                })
            });

            if (!response.ok) {
                throw new Error('邮件服务响应错误');
            }

            return {
                success: true,
                message: '验证码已发送',
                method: 'third-party'
            };
        } catch (error) {
            console.error('第三方邮件服务失败:', error);
            // 降级到控制台输出
            return this.sendViaConsole(email, code, subject, htmlContent);
        }
    }

    // 设置服务类型
    setServiceType(type) {
        this.serviceType = type;
    }
}

// 导出邮件服务实例
window.EmailService = new EmailService();
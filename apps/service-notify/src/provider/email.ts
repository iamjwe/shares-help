import { Injectable, Inject } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailCli {
  private fromEmail: string;
  private toEmails: string[];

  constructor(
    @Inject(ConfigService) private readonly configServices: ConfigService,
    private readonly mailerService: MailerService,
  ) {
    const { from: fromEmail, to: toEmails } =
      this.configServices.get('notify.email');
    this.fromEmail = `${fromEmail.user}@${fromEmail.domain}`;
    this.toEmails = toEmails.addrs;
  }

  // 每种格式的邮件配置一个方法，参数为主题，标题、内容
  sendTextToSelf(subject: string, text: string): void {
    this.mailerService
      .sendMail({
        to: this.fromEmail,
        from: this.fromEmail,
        subject: subject,
        text: text,
      })
      .then(() => {
        console.log(`数据更新邮件发送成功，email: ${this.fromEmail}`);
      })
      .catch((e) => {
        console.log(e);
        console.log(`数据更新邮件发送失败，email: ${this.fromEmail}`);
      });
  }

  // 每种格式的邮件配置一个方法，参数为主题，标题、内容
  sendHtmlToSelf(subject: string, html: string): void {
    this.mailerService
      .sendMail({
        to: this.fromEmail,
        from: this.fromEmail,
        subject: subject,
        html: html,
      })
      .then(() => {
        console.log(`邮件批量发送成功，email: ${this.fromEmail}`);
      })
      .catch((e) => {
        console.log(e);
        console.log(`邮件批量发送失败，email: ${this.fromEmail}`);
      });
  }

  // 每种格式的邮件配置一个方法，参数为主题，标题、内容
  sendText(subject: string, text: string): void {
    this.mailerService
      .sendMail({
        to: this.toEmails,
        from: this.fromEmail,
        subject: subject,
        text: text,
      })
      .then(() => {
        console.log(`邮件批量发送成功，email: ${this.toEmails.join(',')}`);
      })
      .catch((e) => {
        console.log(e);
        console.log(`邮件批量发送失败，email: ${this.toEmails.join(',')}`);
      });
  }

  // 每种格式的邮件配置一个方法，参数为主题，标题、内容
  sendHtml(subject: string, html: string): void {
    this.mailerService
      .sendMail({
        to: this.toEmails,
        from: this.fromEmail,
        subject: subject,
        html: html,
      })
      .then(() => {
        console.log(`邮件批量发送成功，email: ${this.toEmails.join(',')}`);
      })
      .catch((e) => {
        console.log(e);
        console.log(`邮件批量发送失败，email: ${this.toEmails.join(',')}`);
      });
  }
}

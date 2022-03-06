import { Module } from '@nestjs/common';
import { NotifyController } from './notify.controller';
import { NotifyService } from './notify.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as yaml from 'js-yaml';
import { readFileSync } from 'fs';
import { join } from 'path';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { EmailCli } from './provider/email';
import { ClientsModule, Transport } from '@nestjs/microservices';
import TushareData from '@/service-core/src/tushare.data';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [
        () => {
          return yaml.load(
            readFileSync(
              join(`${process.cwd()}/apps`, process.env.CONFIG_FILE_NAME),
              'utf8',
            ),
          ) as Record<string, any>;
        },
      ],
    }),
    ClientsModule.registerAsync([
      {
        name: 'SERVICE_DATA',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => {
          const { port } = config.get('data.tcp');
          return {
            transport: Transport.TCP,
            options: {
              port,
            },
          };
        },
      },
    ]),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const { user, pass, domain, name } = config.get('notify.email.from');
        return {
          transport: {
            host: `smtp.${domain}`,
            port: '465',
            auth: {
              user,
              pass,
            },
          },
          defaults: {
            from: `"${name}" <${user}@${domain}>`,
          },
          template: {
            dir: `${process.cwd()}/apps` + '/templates',
            adapter: new EjsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
    }),
  ],
  controllers: [NotifyController],
  providers: [NotifyService, EmailCli, TushareData],
})
export class NotifyModule {}

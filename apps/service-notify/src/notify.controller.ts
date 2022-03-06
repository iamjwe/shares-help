import { Controller, Get } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import {
  NotifyService,
  StockBackTestNotifyType,
  StockSelectNotifyType,
} from './notify.service';

@Controller()
export class NotifyController {
  constructor(private readonly notifyService: NotifyService) {}

  @EventPattern('sendEmail')
  sendEmail(data: any): void {
    console.log('sendEmial', data);
    this.notifyService.sendEmialTest(data);
  }

  @EventPattern('stock_backTest')
  stockBackTest(data: StockBackTestNotifyType): void {
    this.notifyService.stock_backTest(data);
  }

  @EventPattern('stock_select')
  stockSelect(data: StockSelectNotifyType): void {
    this.notifyService.stock_select(data);
  }
}

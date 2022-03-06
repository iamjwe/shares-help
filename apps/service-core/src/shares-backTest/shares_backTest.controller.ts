import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ResponseData } from '../aop/result';
import LimitStockBackTest from './stock/limit.stock_backTest';

@Controller('backTest')
@ApiTags('回测')
export default class SharesBackTestController {
  constructor(private readonly limitStockBackTest: LimitStockBackTest) {}

  @ApiQuery({ name: 'date', required: false })
  @ApiQuery({ name: 'start_date', required: false })
  @ApiQuery({ name: 'end_date', required: false })
  @ApiOperation({
    description: '短线追热点战法',
  })
  @Get('limit_backTest')
  async limit_backTest(
    @Query('date') date: string,
    @Query('start_date') start_date: string,
    @Query('end_date') end_date: string,
  ): Promise<ResponseData> {
    const data = await this.limitStockBackTest.start({
      date,
      start_date,
      end_date,
    });
    return {
      code: 0,
      data,
    };
  }
}
